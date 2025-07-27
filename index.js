const express = require('express');
const multer = require('multer');
const qaRoutes = require('./routes/qa');
const cors = require('cors');
require('dotenv').config();

const app = express();
// Enable CORS for all origins (or specify allowed origin explicitly)
app.use(cors({
  origin: 'http://localhost:4200', // Angular dev server
  credentials: true
}));
const upload = multer();

app.use(express.json());
app.use('/api/qa', qaRoutes(upload));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
