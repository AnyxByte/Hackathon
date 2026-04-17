import axios from "axios";
import Research from "../models/researchModel.js";
import mongoose from "mongoose";
import { parseStringPromise } from "xml2js";

// ─────────────────────────────────────────────
// HELPERS (reconstructAbstract and cleanText stay the same)
// ─────────────────────────────────────────────
const reconstructAbstract = (invertedIndex) => {
  if (!invertedIndex) return "No abstract available";
  const wordPositions = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    positions.forEach((pos) => { wordPositions[pos] = word; });
  }
  return wordPositions.filter(Boolean).join(" ");
};

const cleanText = (textData) => {
  if (!textData) return "No data available";
  if (typeof textData === "string") return textData;
  if (typeof textData === "object" && textData._) return textData._;
  if (Array.isArray(textData)) return textData.map(cleanText).join(" ");
  return String(textData);
};

// ─────────────────────────────────────────────
// PHASE 1: Depth Fetching (40 PubMed, 40 Alex, 20 Trials)
// ─────────────────────────────────────────────
export const testAllEndpoints = async (disease, intent) => {
  const query = `${intent} AND ${disease}`;
  try {
    const [pubmedSearch, openAlexRes, trialsRes] = await Promise.all([
      axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=40&retmode=json`),
      axios.get(`https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=40&select=title,abstract_inverted_index,authorships,publication_year,id`),
      axios.get(`https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(disease)}&query.term=${encodeURIComponent(intent)}&pageSize=20&format=json`),
    ]);

    const ids = pubmedSearch.data.esearchresult.idlist;
    let pubmedPool = [];
    if (ids.length > 0) {
      const fetchRes = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(",")}&retmode=xml`);
      const parsed = await parseStringPromise(fetchRes.data);
      const articles = parsed?.PubmedArticleSet?.PubmedArticle || [];
      pubmedPool = articles.map((article, i) => {
        const medline = article?.MedlineCitation?.[0];
        const articleData = medline?.Article?.[0];
        return {
          title: cleanText(articleData?.ArticleTitle?.[0]) || "No Title",
          abstract: (articleData?.Abstract?.[0]?.AbstractText || []).map(cleanText).join(" ") || "No abstract available",
          authors: (articleData?.AuthorList?.[0]?.Author || []).slice(0, 2).map(a => `${a.ForeName?.[0] || ""} ${a.LastName?.[0] || ""}`.trim()),
          year: medline?.DateCompleted?.[0]?.Year?.[0] || "2024",
          source: "PubMed",
          url: `https://pubmed.ncbi.nlm.nih.gov/${ids[i]}`,
        };
      });
    }

    const alexPool = (openAlexRes.data.results || []).map(r => ({
      title: r.title || "No Title",
      abstract: reconstructAbstract(r.abstract_inverted_index),
      authors: (r.authorships || []).slice(0, 2).map(a => a.author?.display_name),
      year: r.publication_year || "2024",
      source: "OpenAlex",
      url: r.id || "",
    }));

    const trialPool = (trialsRes.data.studies || []).map(s => {
      const id = s.protocolSection;
      return {
        title: id?.identificationModule?.officialTitle || id?.identificationModule?.briefTitle || "No Title",
        abstract: id?.descriptionModule?.briefSummary || "No summary available",
        authors: [],
        year: id?.statusModule?.startDateStruct?.date?.split("-")[0] || "2024",
        source: "ClinicalTrials",
        url: `https://clinicaltrials.gov/study/${id?.identificationModule?.nctId}`,
        status: id?.statusModule?.overallStatus || "Unknown",
        location: id?.contactsLocationsModule?.locations?.[0]?.country || "Global",
      };
    });

    return [...pubmedPool, ...alexPool, ...trialPool];
  } catch (error) {
    console.error("API Error:", error.message);
    return [];
  }
};

// ─────────────────────────────────────────────
// MAIN HANDLER: Optimized & Clean Output
// ─────────────────────────────────────────────
export const handleQuery = async (req, res) => {
  try {
    const { disease, intent } = req.body;
    if (!disease || !intent) return res.status(400).json({ msg: "Missing fields" });

    const currentSessionId = new mongoose.Types.ObjectId();

    // STEP 1: Parallel Fetch & Query Embedding
    console.log("📥 Fetching data and vectorizing query...");
    const [broadPool, queryVectorRes] = await Promise.all([
      testAllEndpoints(disease, intent),
      axios.post("http://localhost:11434/api/embeddings", {
        model: "nomic-embed-text",
        prompt: `Focus on ${disease}. Researching: ${intent}`,
      })
    ]);

    if (!broadPool.length) return res.status(404).json({ msg: "No results found." });

    // STEP 2: Re-Ranking (Prioritize Disease relevance)
    const refinedPool = broadPool.sort((a, b) => {
        const d = disease.toLowerCase();
        const scoreA = a.title.toLowerCase().includes(d) ? 2 : 0;
        const scoreB = b.title.toLowerCase().includes(d) ? 2 : 0;
        return scoreB - scoreA;
    }).slice(0, 15);

    // STEP 3: Parallel Vectorization (Top 15 Only)
    console.log("🧠 Vectorizing candidates...");
    const embeddingPromises = refinedPool.map(async (item) => {
      try {
        const res = await axios.post("http://localhost:11434/api/embeddings", {
          model: "nomic-embed-text",
          prompt: `Disease: ${disease}. Title: ${item.title}. Abstract: ${item.abstract.slice(0, 300)}`,
        });
        // Important: return a plain object, not a Mongoose instance
        return { ...item, sessionId: currentSessionId, embedding: res.data.embedding };
      } catch (err) { return null; }
    });

    const docsToSave = (await Promise.all(embeddingPromises)).filter(Boolean);
    await Research.insertMany(docsToSave);

    // STEP 4: Vector Search (Corrected $project)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    let top8Results = await Research.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVectorRes.data.embedding,
          numCandidates: 15,
          limit: 8,
          filter: { sessionId: { $eq: currentSessionId } },
        },
      },
      { 
        $project: { 
          _id: 1, title: 1, abstract: 1, authors: 1, year: 1, 
          source: 1, url: 1, status: 1, location: 1 
        } 
      }
    ]);

    // Fallback using .lean() for plain JSON
    if (!top8Results.length) {
      top8Results = await Research.find({ sessionId: currentSessionId })
        .limit(8)
        .select("-embedding")
        .lean();
    }

    // STEP 5: LLM Synthesis (Prompt Tweaked for Speed & Relevance)
    console.log("✍️ Generating summary...");
    const context = top8Results
      .map((doc, i) => `[Source ${i + 1}] Title: ${doc.title} | Source: ${doc.source} | Abstract: ${doc.abstract.slice(0, 500)}`)
      .join("\n\n");

    const llmRes = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2:1b", // Keep 1b for the < 30s target
      prompt: `You are CuraLink. The user has ${disease}. They are asking about ${intent}.
      Using ONLY these sources, answer the query. If a source is irrelevant to ${disease}, skip it.
      
      SOURCES:
      ${context}

      FORMAT:
      ## Condition Overview
      ## Key Research Insights (cite sources like [Source 1])
      ## Clinical Trial Opportunities
      ## Summary
      ## Important Disclaimer`,
      stream: false,
    });

    // STEP 6: Final Clean Mapping for Response
    const cleanResults = top8Results.map(doc => ({
      title: doc.title,
      abstract: doc.abstract,
      authors: doc.authors,
      year: doc.year,
      source: doc.source,
      url: doc.url,
      status: doc.status || null,
      location: doc.location || null
    }));

    return res.status(200).json({
      msg: "Medical Research Analysis Complete",
      sessionId: currentSessionId,
      summary: llmRes.data.response,
      publications: cleanResults.filter(r => r.source !== "ClinicalTrials"),
      trials: cleanResults.filter(r => r.source === "ClinicalTrials"),
      sources: cleanResults
    });

  } catch (error) {
    console.error("Pipeline Error:", error);
    return res.status(500).json({ msg: "Error", error: error.message });
  }
};