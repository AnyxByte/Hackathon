import axios from "axios";
import Research from "../models/researchModel.js";
import Conversation from "../models/conversationModel.js";
import mongoose from "mongoose";
import { parseStringPromise } from "xml2js";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

// Initialize Hugging Face Client
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

// ─────────────────────────────────────────────
// IN-MEMORY CACHE (30 min TTL)
// ─────────────────────────────────────────────
const queryCache = new Map();

const getCacheKey = (disease, intent) =>
  `${disease.toLowerCase().trim()}:${intent.toLowerCase().trim()}`;

const setCache = (key, value) => {
  queryCache.set(key, value);
  setTimeout(() => queryCache.delete(key), 1000 * 60 * 30);
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const reconstructAbstract = (invertedIndex) => {
  if (!invertedIndex) return "";
  const wordPositions = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    positions.forEach((pos) => {
      wordPositions[pos] = word;
    });
  }
  return wordPositions.filter(Boolean).join(" ");
};

const cleanText = (textData) => {
  if (!textData) return "";
  if (typeof textData === "string") return textData;
  if (typeof textData === "object" && textData._) return textData._;
  if (Array.isArray(textData)) return textData.map(cleanText).join(" ");
  return String(textData);
};

// ─────────────────────────────────────────────
// BM25-STYLE KEYWORD SCORER (UPGRADED)
// ─────────────────────────────────────────────
const keywordScore = (item, intentKeywords, diseaseKeywords) => {
  const titleText = item.title?.toLowerCase() || "";
  const abstractText = item.abstract?.toLowerCase() || "";

  let score = 0;

  // ⚡ INTENT words get a massive 5x multiplier!
  for (const kw of intentKeywords) {
    const titleMatches = (titleText.match(new RegExp(kw, "g")) || []).length;
    const abstractMatches = (abstractText.match(new RegExp(kw, "g")) || [])
      .length;
    score += (titleMatches * 3 + abstractMatches) * 5;
  }

  // Disease words get standard scoring
  for (const kw of diseaseKeywords) {
    const titleMatches = (titleText.match(new RegExp(kw, "g")) || []).length;
    const abstractMatches = (abstractText.match(new RegExp(kw, "g")) || [])
      .length;
    score += titleMatches * 3 + abstractMatches;
  }

  const recency = item.year
    ? Math.min(10, Math.max(0, parseInt(item.year) - 2015))
    : 0;
  return score * 10 + recency;
};

// ─────────────────────────────────────────────
// PHASE 1: Fetch from all APIs (FAULT-TOLERANT)
// ─────────────────────────────────────────────
export const testAllEndpoints = async (disease, intent) => {
  const query = `${intent} AND ${disease}`;

  // ⚡ Helper function to prevent one failing API from crashing the others
  const fetchSafe = (promise, fallbackData, name) =>
    promise.catch((err) => {
      console.error(`⚠️ ${name} API Failed: ${err.message}`);
      return { data: fallbackData }; // Returns empty mock data so the app survives
    });

  try {
    const [pubmedSearch, openAlexRes, trialsRes] = await Promise.all([
      fetchSafe(
        axios.get(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
            query,
          )}&retmax=15&sort=pub+date&retmode=json`,
        ),
        { esearchresult: { idlist: [] } },
        "PubMed Search",
      ),
      fetchSafe(
        axios.get(
          `https://api.openalex.org/works?search=${encodeURIComponent(
            query,
          )}&per-page=40&sort=relevance_score:desc&select=title,abstract_inverted_index,authorships,publication_year,id`,
        ),
        { results: [] },
        "OpenAlex",
      ),
      fetchSafe(
        axios.get(
          `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(
            disease,
          )}&query.term=${encodeURIComponent(intent)}&pageSize=20&format=json`,
        ),
        { studies: [] },
        "ClinicalTrials",
      ),
    ]);

    const ids = pubmedSearch.data.esearchresult.idlist || [];
    let pubmedPool = [];

    if (ids.length > 0) {
      try {
        const fetchRes = await axios.get(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(
            ",",
          )}&retmode=xml`,
        );
        const parsed = await parseStringPromise(fetchRes.data);
        const articles = parsed?.PubmedArticleSet?.PubmedArticle || [];

        pubmedPool = articles.map((article, i) => {
          const medline = article?.MedlineCitation?.[0];
          const articleData = medline?.Article?.[0];
          const abstractTexts = articleData?.Abstract?.[0]?.AbstractText || [];
          const authors = (articleData?.AuthorList?.[0]?.Author || [])
            .slice(0, 3)
            .map((a) =>
              `${a.ForeName?.[0] || ""} ${a.LastName?.[0] || ""}`.trim(),
            )
            .filter(Boolean);

          return {
            title: cleanText(articleData?.ArticleTitle?.[0]) || "No Title",
            abstract: abstractTexts.map(cleanText).join(" ") || "",
            authors,
            year:
              medline?.DateCompleted?.[0]?.Year?.[0] ||
              medline?.DateRevised?.[0]?.Year?.[0] ||
              "",
            source: "PubMed",
            url: `https://pubmed.ncbi.nlm.nih.gov/${ids[i]}`,
          };
        });
      } catch (pubmedFetchErr) {
        console.error("⚠️ PubMed XML Fetch Failed:", pubmedFetchErr.message);
      }
    }

    const alexPool = (openAlexRes.data.results || []).map((r) => ({
      title: r.title || "No Title",
      abstract: reconstructAbstract(r.abstract_inverted_index),
      authors: (r.authorships || [])
        .slice(0, 3)
        .map((a) => a.author?.display_name)
        .filter(Boolean),
      year: r.publication_year?.toString() || "",
      source: "OpenAlex",
      url: r.id || "",
    }));

    const trialPool = (trialsRes.data.studies || []).map((s) => {
      const proto = s.protocolSection;
      const contacts = proto?.contactsLocationsModule?.centralContacts || [];
      const locations = proto?.contactsLocationsModule?.locations || [];
      const eligibility = proto?.eligibilityModule;

      return {
        title:
          proto?.identificationModule?.officialTitle ||
          proto?.identificationModule?.briefTitle ||
          "No Title",
        abstract: proto?.descriptionModule?.briefSummary || "",
        authors: [],
        year: proto?.statusModule?.startDateStruct?.date?.split("-")[0] || "",
        source: "ClinicalTrials",
        url: `https://clinicaltrials.gov/study/${proto?.identificationModule?.nctId}`,
        status: proto?.statusModule?.overallStatus || "Unknown",
        location:
          locations
            .map((l) => `${l.city || ""} ${l.country || ""}`.trim())
            .slice(0, 3)
            .join(", ") || "Not specified",
        contact: contacts[0]
          ? `${contacts[0].name || "N/A"} | ${contacts[0].email || "N/A"} | ${contacts[0].phone || "N/A"}`
          : "Not available",
        eligibilityCriteria:
          eligibility?.eligibilityCriteria?.slice(0, 500) || "Not specified",
        minAge: eligibility?.minimumAge || "N/A",
        maxAge: eligibility?.maximumAge || "N/A",
        sex: eligibility?.sex || "All",
      };
    });

    const broadPool = [...pubmedPool, ...alexPool, ...trialPool];
    console.log(
      `✅ Fetched: ${pubmedPool.length} PubMed | ${alexPool.length} OpenAlex | ${trialPool.length} Trials = ${broadPool.length} total`,
    );
    return broadPool;
  } catch (error) {
    console.error("Critical Fetch Pipeline Error:", error.message);
    return [];
  }
};

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
export const handleQuery = async (req, res) => {
  const startTime = Date.now();
  const userId = req.user._id;

  try {
    const { query, conversationHistory = [], sessionId } = req.body;

    if (!query) {
      return res.status(400).json({ msg: "query is required." });
    }

    console.log(`\n🚀 Raw User Input: "${query}"`);

    // ⚡ Generate sessionId EARLY so DB save can use it for cached hits
    const currentSessionId =
      sessionId || new mongoose.Types.ObjectId().toString();

    // ─────────────────────────────────────────────
    // 🧠 PHASE 0: NLP Query Extraction
    // ─────────────────────────────────────────────
    console.time("🧠 Phase 0: Extraction");

    const recentHistory = conversationHistory
      .slice(-3)
      .map((m) => `${m.role === "user" ? "User" : "CuraLink"}: ${m.content}`)
      .join("\n");

    const extractionPrompt = `You are a strict medical data extractor.
    
    Task:
    1. Identify the primary disease/condition being discussed. (If none, return "General").
    2. Identify the specific subject/focus of the query (e.g., exact drug names, supplements, procedures).
    CRITICAL: DO NOT categorize the intent. Extract the actual specific words the user typed.
    CRITICAL CONTEXT RULE: If the Current Input uses pronouns (e.g., "it", "those", "this diet") or refers to a previous topic, you MUST look at the Recent Conversation History and include the original disease, drug, or topic in your extracted JSON.
    
    RESPOND STRICTLY WITH ONLY A RAW JSON OBJECT. No markdown, no backticks, no explanations.
    
    Example 1:
    Input: "Can I take Vitamin D in lung cancer?"
    Output: {"disease": "lung cancer", "intent": "Vitamin D"}
    
    Example 2:
    Input: "What are the side effects of chemotherapy?"
    Output: {"disease": "General", "intent": "chemotherapy side effects"}
    
    ---
    Recent Conversation History:
    ${recentHistory || "None"}

    Current Input: "${query}"
    Output:`;

    let disease = "General";
    let intent = query;

    try {
      const extractRes = await hf.chatCompletion({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [{ role: "user", content: extractionPrompt }],
        max_tokens: 50,
        temperature: 0.1,
      });

      const rawText = extractRes.choices[0]?.message?.content
        .replace(/```json|```/g, "")
        .trim();
      const extractedData = JSON.parse(rawText);

      disease = extractedData.disease || "General";
      intent = extractedData.intent || query;
    } catch (e) {
      console.error("Extraction failed, falling back to raw query.", e.message);
    }

    console.log(`✅ Extracted -> Disease: "${disease}" | Intent: "${intent}"`);
    console.timeEnd("🧠 Phase 0: Extraction");

    // ─────────────────────────────────────────────
    // 💾 DATABASE SAVE HELPER
    // ─────────────────────────────────────────────
    // This allows us to use your exact logic for both cached hits and new hits
    const saveInteractionToDb = async (overview, pubs, trials) => {
      const newUserMessage = { role: "user", type: "text", content: query };
      const newAiMessage = {
        role: "assistant",
        type: "structured_report",
        content: overview,
        publications: pubs,
        trials: trials,
      };

      try {
        const updatedChat = await Conversation.findOneAndUpdate(
          { sessionId: currentSessionId },
          {
            $setOnInsert: { userId: userId },
            $set: { lastDiseaseContext: disease },
            $push: { messages: { $each: [newUserMessage, newAiMessage] } },
          },
          { upsert: true, new: true },
        );
        console.log(
          `✅ Saved to DB. Chat contains ${updatedChat.messages.length} messages.`,
        );
      } catch (err) {
        console.error("❌ DB Save Error:", err);
      }
    };

    // ─────────────────────────────────────────────
    // ⚡ CACHE CHECK
    // ─────────────────────────────────────────────
    const cacheKey = getCacheKey(disease, intent);
    if (queryCache.has(cacheKey)) {
      console.log("⚡ Cache hit — returning instantly");
      const cachedData = queryCache.get(cacheKey);

      // ⚡ Await the database save before responding so it doesn't vanish on reload!
      await saveInteractionToDb(
        cachedData.overview,
        cachedData.publications,
        cachedData.trials,
      );

      return res.status(200).json({
        ...cachedData,
        sessionId: currentSessionId,
        cached: true,
        timeTaken: "0s",
      });
    }

    // ─────────────────────────────────────────────
    // 📥 PHASE 1: API Fetch
    // ─────────────────────────────────────────────
    console.time("📥 Phase 1: API Fetch");
    const broadPool = await testAllEndpoints(disease, intent);
    console.timeEnd("📥 Phase 1: API Fetch");

    if (!broadPool.length) {
      return res.status(404).json({ msg: "No results found." });
    }

    // ─────────────────────────────────────────────
    // 🎯 PHASE 2: Upgraded Keyword Rank
    // ─────────────────────────────────────────────
    console.time("🎯 Phase 2: Keyword Rank");

    const stopWords = new Set([
      "a",
      "an",
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "of",
      "to",
      "for",
      "with",
      "is",
      "can",
      "i",
      "take",
      "what",
      "are",
      "it",
      "this",
    ]);

    const intentKeywords = [
      ...new Set(intent.toLowerCase().split(/\s+/)),
    ].filter((k) => !stopWords.has(k) && k.trim() !== "");
    const diseaseKeywords = [
      ...new Set(disease.toLowerCase().split(/\s+/)),
    ].filter((k) => !stopWords.has(k) && k.trim() !== "");

    const publications = broadPool.filter(
      (item) => item.source !== "ClinicalTrials",
    );
    const trials = broadPool.filter((item) => item.source === "ClinicalTrials");

    const topPublications = publications
      .filter((item) => item.abstract && item.abstract.length > 30)
      .map((item) => ({
        ...item,
        _score: keywordScore(item, intentKeywords, diseaseKeywords),
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);

    const topTrials = trials
      .map((item) => ({
        ...item,
        _score: keywordScore(item, intentKeywords, diseaseKeywords),
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 3);

    const rankedDocs = [...topPublications, ...topTrials];

    console.timeEnd("🎯 Phase 2: Keyword Rank");
    console.log(
      `✅ Top docs selected: ${topPublications.length} publications + ${topTrials.length} trials`,
    );

    // ─────────────────────────────────────────────
    // 💾 SECURE DB SAVE FOR RESEARCH (Awaited!)
    // ─────────────────────────────────────────────
    try {
      await Research.insertMany(
        rankedDocs.map(({ _score, ...rest }) => ({
          ...rest,
          sessionId: currentSessionId,
        })),
      );
      console.log("✅ Research documents safely secured in DB.");
    } catch (err) {
      console.error("❌ Background DB save error:", err);
    }

    const conversationContext =
      conversationHistory.length > 0
        ? `PREVIOUS CONTEXT:\n${conversationHistory
            .slice(-4)
            .map(
              (m) =>
                `${m.role === "user" ? "User" : "CuraLink"}: ${m.content?.slice(0, 150)}`,
            )
            .join("\n")}\n\n`
        : "";

    const docContext = rankedDocs
      .map(
        (doc, i) =>
          `[Source ${i + 1}]\nTitle: ${doc.title}\nYear: ${doc.year || "N/A"} | Source: ${doc.source} | Authors: ${doc.authors?.join(", ") || "N/A"}\nAbstract: ${doc.abstract?.slice(0, 300)}\nURL: ${doc.url}${doc.status ? `\nStatus: ${doc.status}` : ""}${doc.location ? ` | Location: ${doc.location}` : ""}${doc.contact ? `\nContact: ${doc.contact}` : ""}${doc.eligibilityCriteria ? `\nEligibility: ${doc.eligibilityCriteria?.slice(0, 200)}` : ""}`,
      )
      .join("\n\n---\n\n");

    const finalPrompt = `You are CuraLink, an expert Medical Research AI.
${conversationContext}Patient Disease: ${disease}
Research Query: ${intent}

SOURCES:
${docContext}

TASK:
Based ONLY on the sources above, write a concise, expert 3-4 sentence medical overview answering the user's specific query.
CRITICAL RULE: If the exact answer (e.g., a specific dosage, side effect, or location) is NOT found in the provided sources, you MUST explicitly state "The retrieved research does not specify [X]." Do not repeat general information to fill space.
Do NOT list out the publications or trials. Just provide the analytical summary and cite your claims like [Source 1].
Do NOT output markdown headers, just the plain text paragraph.`;

    // ─────────────────────────────────────────────
    // ✍️ PHASE 6: LLM Generation
    // ─────────────────────────────────────────────
    console.time("✍️ Phase 6: LLM");

    const chatCompletion = await hf.chatCompletion({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [{ role: "user", content: finalPrompt }],
      max_tokens: 300,
      temperature: 0.2,
    });

    const llmText =
      chatCompletion.choices[0]?.message?.content || "Analysis complete.";

    console.timeEnd("✍️ Phase 6: LLM");

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎯 TOTAL: ${elapsed}s`);

    const responsePayload = {
      sessionId: currentSessionId,
      role: "assistant",
      type: "structured_report",
      overview: llmText.trim(),
      publications: topPublications.map(({ _score, __v, ...rest }) => rest),
      trials: topTrials.map(({ _score, __v, ...rest }) => rest),
    };

    // ─────────────────────────────────────────────
    // 💾 AUTO-SAVE TO MONGODB (New DB Save)
    // ─────────────────────────────────────────────
    // ⚡ Await the database save before responding so it doesn't vanish on reload!
    await saveInteractionToDb(
      responsePayload.overview,
      responsePayload.publications,
      responsePayload.trials,
    );

    setCache(cacheKey, responsePayload);

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Pipeline Error:", error);
    return res
      .status(500)
      .json({ msg: "Endpoint failed", error: error.message });
  }
};
