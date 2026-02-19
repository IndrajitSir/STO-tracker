const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stoRoutes = require('./routes/sto.routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/stos', stoRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
