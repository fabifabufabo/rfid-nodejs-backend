const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./middleware/logger');
const rfidRoutes = require('./routes/rfid');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(logger);
app.use('/rfid', rfidRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});