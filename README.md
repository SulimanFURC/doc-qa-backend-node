# 🛠️ Backend Documentation - Document Q&A Assistant

This is the backend for the **Document Q&A Assistant**, which allows users to upload PDF files and ask questions using Retrieval-Augmented Generation (RAG) with OpenAI and Redis.

---

## 🧱 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **File Upload:** multer
- **PDF Parsing:** pdf-parse
- **Vector Store:** Redis (with Vector Search)
- **Embeddings & LLM:** OpenAI API
- **Environment Config:** dotenv

---

## 📁 Folder Structure

```
backend/
│
├── index.js                  # Main server file
├── routes/
│   └── qa.js                 # Routes for uploading and asking questions
├── utils/
│   └── redisClient.js        # Redis client and vector search logic
├── .env                      # Environment variables
└── package.json              # Dependencies and scripts
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create a `.env` File

```env
OPENAI_API_KEY=your_openai_key
REDIS_URL=redis://localhost:6379
PORT=5000
```

### 3. Start Redis Stack (Vector Search Enabled)

```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack
```

You can access RedisInsight GUI at: http://localhost:8001

### 4. Start Backend Server

```bash
npm start
```

---

## 📬 API Endpoints

### `POST /api/qa/upload`

Uploads a PDF and extracts chunks for embedding.

- **FormData Key:** `file`
- **Allowed File Type:** `.pdf`

Returns:
```json
{
  "message": "PDF uploaded and embeddings stored."
}
```

---

### `POST /api/qa/ask`

Ask a question related to the uploaded document.

#### Request Body:

```json
{
  "question": "What is the document about?"
}
```

#### Response:

```json
{
  "answer": "This document discusses..."
}
```

---

## 🧠 Redis Vector Index

You can manually create an index (if not created programmatically):

```bash
FT.CREATE doc_idx ON HASH PREFIX 1 doc: SCHEMA content VECTOR FLAT 6 TYPE FLOAT32 DIM 1536 DISTANCE_METRIC COSINE
```

---

## 🚀 Start Script

In `package.json`, ensure this script is defined:

```json
"scripts": {
  "start": "nodemon index.js"
}
```

---

## ✅ Dependencies Summary

```bash
npm install express multer pdf-parse axios dotenv cors redis
npm install --save-dev nodemon
```

---

## 🔐 Security Note

- Validate file type to prevent malicious uploads.
- Rate limit question API to prevent abuse.

---

## 📄 License

MIT License

---

## ✨ Author

Suliman Munawar Khan
