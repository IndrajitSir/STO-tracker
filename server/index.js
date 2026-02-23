const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stoRoutes = require('./routes/sto.routes');

const app = express();
app.use(cors({
  origin: ['https://sto-tracker.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());

app.use('/api/stos', stoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
