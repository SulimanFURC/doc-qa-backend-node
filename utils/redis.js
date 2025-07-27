const redis = require('redis');
const axios = require('axios');
require('dotenv').config();

const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect();

async function embedText(text) {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      model: 'text-embedding-3-small',
      input: text,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data[0].embedding;
}

async function storeEmbeddings(chunks) {
  await client.del('doc_chunks');
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]);
    await client.hSet(`doc_chunks:${i}`, {
      chunk: chunks[i],
      vector: JSON.stringify(embedding),
    });
  }
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function queryTopK(question, topK = 3) {
  const questionVec = await embedText(question);
  const keys = await client.keys('doc_chunks:*');

  const similarities = [];
  for (const key of keys) {
    const data = await client.hGetAll(key);
    const vec = JSON.parse(data.vector);
    const score = cosineSimilarity(questionVec, vec);
    similarities.push({ chunk: data.chunk, score });
  }

  return similarities.sort((a, b) => b.score - a.score).slice(0, topK).map(x => x.chunk);
}

module.exports = { storeEmbeddings, queryTopK };
