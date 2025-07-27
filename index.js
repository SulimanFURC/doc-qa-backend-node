const express = require('express');
const multer = require('multer');
const qaRoutes = require('./routes/qa');
require('dotenv').config();

const app = express();
const upload = multer();

app.use(express.json());
app.use('/api/qa', qaRoutes(upload));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
