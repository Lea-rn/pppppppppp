const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main stats routes
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');
app.use('/api', statsRoutes);
app.use('/api', uploadRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('DINAMO API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
