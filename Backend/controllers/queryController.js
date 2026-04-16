import axios from "axios";
import Research from "../models/researchModel.js";
import mongoose from "mongoose";

export const testAllEndpoints = async (disease, intent) => {
  const query = `${intent} AND ${disease}`;

  try {
    const [pubmedSearch, openAlexRes, trialsRes] = await Promise.all([
      axios.get(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=10&retmode=json`,
      ),
      axios.get(`https://api.openalex.org/works?search=${query}&per-page=10`),
      axios.get(
        `https://clinicaltrials.gov/api/v2/studies?query.cond=${disease}&query.term=${intent}&pageSize=10&format=json`,
      ),
    ]);

    // 1. PubMed: Get titles for the IDs
    const ids = pubmedSearch.data.esearchresult.idlist;
    let pubmedPool = [];
    if (ids.length > 0) {
      const details = await axios.get(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`,
      );
      pubmedPool = ids.map((id) => ({
        title: details.data.result[id].title,
        abstract: details.data.result[id].fulljournalname, // PubMed Summary is thin, title is key
        source: "PubMed",
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}`,
      }));
    }

    // 2. OpenAlex: Map Results
    const alexPool = openAlexRes.data.results.map((r) => ({
      title: r.title,
      abstract: r.display_name,
      source: "OpenAlex",
      url: r.id,
    }));

    // 3. ClinicalTrials: Map Results
    const trialPool = trialsRes.data.studies.map((s) => ({
      title:
        s.protocolSection.identificationModule.officialTitle ||
        s.protocolSection.identificationModule.briefTitle,
      abstract: s.protocolSection.descriptionModule?.briefSummary || "",
      source: "ClinicalTrials",
      url: `https://clinicaltrials.gov/study/${s.protocolSection.identificationModule.nctId}`,
    }));

    // FINAL BROAD POOL
    const broadPool = [...pubmedPool, ...alexPool, ...trialPool];
    console.log("broadPool", broadPool);

    console.log(`✅ Success! Found ${broadPool.length} total items.`);
    return broadPool;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const handleQuery = async (req, res) => {
  try {
    const { disease, intent } = req.body;

    // Always generate a FRESH sessionId — never reuse old ones
    const currentSessionId = new mongoose.Types.ObjectId();

    // PHASE 1: Broad Pool Discovery
    const broadPool = await testAllEndpoints(disease, intent);

    if (!broadPool || broadPool.length === 0) {
      return res.status(404).json({
        msg: "No research data found for this query.",
        results: [],
      });
    }

    // PHASE 2: Vectorization
    let docsWithEmbeddings = [];
    console.log("🧠 Vectorizing research pool...");

    for (const item of broadPool) {
      try {
        const ollamaRes = await axios.post(
          "http://localhost:11434/api/embeddings",
          {
            model: "nomic-embed-text",
            prompt: `Title: ${item.title} Content: ${item.abstract}`,
          },
        );

        // DEBUG — check embedding dimension
        console.log(
          `Embedding length for "${item.title?.slice(0, 30)}":`,
          ollamaRes.data.embedding?.length,
        );

        docsWithEmbeddings.push({
          ...item,
          sessionId: currentSessionId,
          embedding: ollamaRes.data.embedding,
        });
      } catch (err) {
        console.error(
          `Skipping item "${item.title}" due to Ollama error:`,
          err.message,
        );
      }
    }

    if (docsWithEmbeddings.length === 0) {
      return res.status(500).json({
        msg: "Vectorization failed for all items.",
        results: [],
      });
    }

    // PHASE 3: Storage — NO deleteMany, fresh sessionId each time
    await Research.insertMany(docsWithEmbeddings);
    console.log(`✅ Saved ${docsWithEmbeddings.length} papers to MongoDB.`);

    // DEBUG — verify saved correctly
    const sample = await Research.findOne({ sessionId: currentSessionId });
    console.log(
      "✅ Sample embedding length from DB:",
      sample?.embedding?.length,
    );
    console.log("✅ Sample sessionId from DB:", sample?.sessionId);

    // Wait for Atlas to index the new documents
    console.log("⏳ Waiting for Atlas to index...");
    await new Promise((resolve) => setTimeout(resolve, 8000)); // 8 seconds

    // PHASE 4: Vectorize the user query
    const queryVectorRes = await axios.post(
      "http://localhost:11434/api/embeddings",
      {
        model: "nomic-embed-text",
        prompt: `Searching for research on: ${intent} regarding ${disease}`,
      },
    );

    console.log(
      "✅ Query vector length:",
      queryVectorRes.data.embedding?.length,
    );

    // PHASE 5: Vector Search
    let top8Results = await Research.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVectorRes.data.embedding,
          numCandidates: 30,
          limit: 8,
          filter: { sessionId: { $eq: currentSessionId } },
        },
      },
      {
        $project: { embedding: 0 },
      },
    ]);

    console.log(`🔍 Vector search returned: ${top8Results.length} results`);

    // Fallback if index isn't ready
    if (top8Results.length === 0) {
      console.log("⚠️ Falling back to standard retrieval...");
      top8Results = await Research.find({ sessionId: currentSessionId })
        .limit(8)
        .select("-embedding");
    }

    // PHASE 6: LLM Synthesis (Generating the Final Answer)
    console.log("✍️ Generating AI Summary using Llama 3...");

    const context = top8Results
      .map(
        (doc, i) =>
          `[Source ${i + 1}]: ${doc.title}. Findings: ${doc.abstract}`,
      )
      .join("\n\n");

    const finalPrompt = `
      You are an expert Medical Research AI. 
      Answer the following question using ONLY the provided research snippets.
      
      User Question: What is the relationship between ${intent} and ${disease}?
      
      Research Context:
      ${context}
      
      Requirements:
      - Use "Source X" citations (e.g., [Source 1]).
      - Be objective and academic.
      - If the context doesn't have the answer, say "Insufficient data."
    `;

    const llmRes = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2",
      prompt: finalPrompt,
      stream: false,
    });

    // Cleanup: Remove temporary session data to save DB space (Optional)
    // await Research.deleteMany({ sessionId: currentSessionId });

    console.log("🎯 Analysis Complete.");

    return res.status(200).json({
      msg: "Medical Research Analysis Complete",
      sessionId: currentSessionId,
      summary: llmRes.data.response,
      sources: top8Results,
    });
  } catch (error) {
    console.error("Pipeline Error:", error);
    return res.status(500).json({
      msg: "Endpoint failed",
      error: error.message,
    });
  }
};
