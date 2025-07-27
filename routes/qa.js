const express = require('express');
const pdfParse = require('pdf-parse');
const { chunkText } = require('../utils/chunker');
const { storeEmbeddings, queryTopK } = require('../utils/redis');
const axios = require('axios');

module.exports = (upload) => {
  const router = express.Router();

  // Upload PDF
  router.post('/upload', upload.single('file'), async (req, res) => {
    const data = await pdfParse(req.file.buffer);
    const chunks = chunkText(data.text, 500);
    await storeEmbeddings(chunks);
    res.send({ message: 'Document uploaded and indexed' });
  });

  // Ask Question
  router.post('/ask', async (req, res) => {
    const { question } = req.body;
    const topChunks = await queryTopK(question, 3);
    const context = topChunks.join('\n');

    const prompt = `Answer the question based on the context below:\n\n${context}\n\nQuestion: ${question}\nAnswer:`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const answer = response.data.choices[0].message.content;
    res.send({ answer });
  });

  return router;
};
