import axios from "axios";
import Research from "../models/researchModel.js";
import Conversation from "../models/conversationModel.js";
import mongoose from "mongoose";
import { parseStringPromise } from "xml2js";

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
// BM25-STYLE KEYWORD SCORER (replaces Ollama embeddings)
// Runs in <5ms, no network call needed
// ─────────────────────────────────────────────
const keywordScore = (item, keywords) => {
  const titleText = item.title?.toLowerCase() || "";
  const abstractText = item.abstract?.toLowerCase() || "";

  let score = 0;
  for (const kw of keywords) {
    // Title matches count 3x more than abstract matches
    const titleMatches = (titleText.match(new RegExp(kw, "g")) || []).length;
    const abstractMatches = (abstractText.match(new RegExp(kw, "g")) || []).length;
    score += titleMatches * 3 + abstractMatches;
  }

  // Recency boost: +1 per year after 2015, capped at +10
  const recency = item.year
    ? Math.min(10, Math.max(0, parseInt(item.year) - 2015))
    : 0;

  return score * 10 + recency;
};

// ─────────────────────────────────────────────
// PHASE 1: Fetch from all 3 APIs in parallel
// ─────────────────────────────────────────────
export const testAllEndpoints = async (disease, intent) => {
  const query = `${intent} AND ${disease}`;

  try {
    // All 3 API calls fire at the same time
    const [pubmedSearch, openAlexRes, trialsRes] = await Promise.all([
      axios.get(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
          query
        )}&retmax=40&sort=pub+date&retmode=json`
      ),
      axios.get(
        `https://api.openalex.org/works?search=${encodeURIComponent(
          query
        )}&per-page=40&sort=relevance_score:desc&select=title,abstract_inverted_index,authorships,publication_year,id`
      ),
      axios.get(
        `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(
          disease
        )}&query.term=${encodeURIComponent(
          intent
        )}&pageSize=20&format=json`
      ),
    ]);

    // ── PubMed: 2nd call (fetch details) runs after search IDs arrive ──
    const ids = pubmedSearch.data.esearchresult.idlist;
    let pubmedPool = [];

    if (ids.length > 0) {
      const fetchRes = await axios.get(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(
          ","
        )}&retmode=xml`
      );
      const parsed = await parseStringPromise(fetchRes.data);
      const articles = parsed?.PubmedArticleSet?.PubmedArticle || [];

      pubmedPool = articles.map((article, i) => {
        const medline = article?.MedlineCitation?.[0];
        const articleData = medline?.Article?.[0];
        const abstractTexts =
          articleData?.Abstract?.[0]?.AbstractText || [];
        const authors = (articleData?.AuthorList?.[0]?.Author || [])
          .slice(0, 3)
          .map((a) =>
            `${a.ForeName?.[0] || ""} ${a.LastName?.[0] || ""}`.trim()
          )
          .filter(Boolean);

        return {
          title:
            cleanText(articleData?.ArticleTitle?.[0]) || "No Title",
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
    }

    // ── OpenAlex ──
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

    // ── ClinicalTrials ──
    const trialPool = (trialsRes.data.studies || []).map((s) => {
      const proto = s.protocolSection;
      const contacts =
        proto?.contactsLocationsModule?.centralContacts || [];
      const locations =
        proto?.contactsLocationsModule?.locations || [];
      const eligibility = proto?.eligibilityModule;

      return {
        title:
          proto?.identificationModule?.officialTitle ||
          proto?.identificationModule?.briefTitle ||
          "No Title",
        abstract: proto?.descriptionModule?.briefSummary || "",
        authors: [],
        year:
          proto?.statusModule?.startDateStruct?.date?.split("-")[0] ||
          "",
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
          eligibility?.eligibilityCriteria?.slice(0, 500) ||
          "Not specified",
        minAge: eligibility?.minimumAge || "N/A",
        maxAge: eligibility?.maximumAge || "N/A",
        sex: eligibility?.sex || "All",
      };
    });

    const broadPool = [...pubmedPool, ...alexPool, ...trialPool];
    console.log(
      `✅ Fetched: ${pubmedPool.length} PubMed | ${alexPool.length} OpenAlex | ${trialPool.length} Trials = ${broadPool.length} total`
    );
    return broadPool;
  } catch (error) {
    console.error("Fetch Error:", error.message);
    return [];
  }
};

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
export const handleQuery = async (req, res) => {
  const startTime = Date.now();

  try {
    const { disease, intent, conversationHistory = [] } = req.body;

    if (!disease || !intent) {
      return res
        .status(400)
        .json({ msg: "disease and intent are required." });
    }

    console.log(`\n🚀 Query: "${intent}" | Disease: "${disease}"`);

    // ── Cache check ──
    const cacheKey = getCacheKey(disease, intent);
    if (queryCache.has(cacheKey)) {
      console.log("⚡ Cache hit — returning instantly");
      return res.status(200).json({
        ...queryCache.get(cacheKey),
        cached: true,
        timeTaken: "0s",
      });
    }

    const currentSessionId = new mongoose.Types.ObjectId();

    // ── PHASE 1: Fetch all APIs ──
    console.time("📥 Phase 1: API Fetch");
    const broadPool = await testAllEndpoints(disease, intent);
    console.timeEnd("📥 Phase 1: API Fetch");

    if (!broadPool.length) {
      return res.status(404).json({ msg: "No results found." });
    }

    console.time("🎯 Phase 2: Keyword Rank");

    const keywords = [
      ...new Set([
        ...disease.toLowerCase().split(/\s+/),
        ...intent.toLowerCase().split(/\s+/),
      ]),
    ].filter((k) => k.length > 2); // skip stop words like "a", "of"

    const publications = broadPool.filter(
      (item) => item.source !== "ClinicalTrials"
    );
    const trials = broadPool.filter(
      (item) => item.source === "ClinicalTrials"
    );

    // Score and rank each group independently
    const topPublications = publications
      .filter((item) => item.abstract && item.abstract.length > 30)
      .map((item) => ({ ...item, _score: keywordScore(item, keywords) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5); // top 5 publications

    const topTrials = trials
      .map((item) => ({ ...item, _score: keywordScore(item, keywords) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 3); // top 3 trials

    const rankedDocs = [...topPublications, ...topTrials];

    console.timeEnd("🎯 Phase 2: Keyword Rank");
    console.log(
      `✅ Top docs selected: ${topPublications.length} publications + ${topTrials.length} trials`
    );

    Research.insertMany(
      rankedDocs.map(({ _score, ...rest }) => ({
        ...rest,
        sessionId: currentSessionId,
      }))
    ).catch((err) => console.error("Background DB save error:", err));

    if (conversationHistory.length > 0) {
      Conversation.findOneAndUpdate(
        { sessionId: currentSessionId },
        { $push: { messages: { $each: conversationHistory } } },
        { upsert: true }
      ).catch(() => {});
    }

    const conversationContext =
      conversationHistory.length > 0
        ? `PREVIOUS CONTEXT:\n${conversationHistory
            .slice(-4)
            .map(
              (m) =>
                `${m.role === "user" ? "User" : "CuraLink"}: ${m.content?.slice(0, 150)}`
            )
            .join("\n")}\n\n`
        : "";

    const context = rankedDocs
      .map(
        (doc, i) =>
          `[Source ${i + 1}]
Title: ${doc.title}
Year: ${doc.year || "N/A"} | Source: ${doc.source} | Authors: ${doc.authors?.join(", ") || "N/A"}
Abstract: ${doc.abstract?.slice(0, 300)}
URL: ${doc.url}${doc.status ? `\nStatus: ${doc.status}` : ""}${doc.location ? ` | Location: ${doc.location}` : ""}${doc.contact ? `\nContact: ${doc.contact}` : ""}${doc.eligibilityCriteria ? `\nEligibility: ${doc.eligibilityCriteria?.slice(0, 200)}` : ""}`
      )
      .join("\n\n---\n\n");

    const finalPrompt = `You are CuraLink, an expert Medical Research AI.
${conversationContext}Patient Disease: ${disease}
Research Query: ${intent}

STRICT RULES:
- Use ONLY the provided sources below
- Cite every claim with [Source X]
- Never hallucinate
- Skip sources irrelevant to ${disease}

SOURCES:
${context}

RESPOND IN THIS EXACT FORMAT:

## Condition Overview
[2-3 sentences about ${disease} from the sources]

## Key Research Insights
[4-5 bullet points with [Source X] citations]

## Clinical Trial Opportunities
[Each trial: Name | Status | Location | Contact | Eligibility summary]
[If none relevant: "No relevant trials found in current results."]

## Summary
[2-3 sentences key takeaway]

## Disclaimer
For research purposes only. Always consult a qualified healthcare professional.`;

    // ── PHASE 6: LLM Generation (qwen2.5:3b — 5x faster than llama3.2) ──
    console.time("✍️ Phase 6: LLM");

    const llmRes = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "qwen2.5:3b",
        prompt: finalPrompt,
        stream: false,
        options: {
          temperature: 0.2, // keep responses factual
          num_predict: 400, // capped for speed (was 700)
          top_p: 0.8,
        },
      }
    );

    console.timeEnd("✍️ Phase 6: LLM");

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎯 TOTAL: ${elapsed}s`);

    const responsePayload = {
      msg: "Medical Research Analysis Complete",
      sessionId: currentSessionId,
      timeTaken: `${elapsed}s`,
      summary: llmRes.data.response,
      publications: topPublications.map(
        ({ _score, __v, ...rest }) => rest
      ),
      trials: topTrials.map(({ _score, __v, ...rest }) => rest),
      sources: rankedDocs.map(({ _score, __v, ...rest }) => rest),
    };

    setCache(cacheKey, responsePayload);

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Pipeline Error:", error);
    return res
      .status(500)
      .json({ msg: "Endpoint failed", error: error.message });
  }
};