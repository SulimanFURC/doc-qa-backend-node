
const express = require('express');
const pdfParse = require('pdf-parse');
const { chunkText } = require('../utils/chunker');
const { storeEmbeddings, queryTopK } = require('../utils/redis');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

module.exports = (upload) => {
  const router = express.Router();


  // Upload PDF (one at a time, generate unique documentId)
  router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      const documentId = uuidv4();
      const data = await pdfParse(req.file.buffer);
      const chunks = chunkText(data.text, 500);
      await storeEmbeddings(documentId, chunks); // store with documentId
      res.send({ message: 'Document uploaded and indexed', documentId });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  });


  // Ask Question (with documentId)
  router.post('/ask', async (req, res) => {
    try {
      const { question, documentId } = req.body;
      if (!question || !documentId) {
        return res.status(400).send({ error: 'question and documentId are required' });
      }
      const topChunks = await queryTopK(documentId, question, 3); // query by documentId
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
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  });

  return router;
};
