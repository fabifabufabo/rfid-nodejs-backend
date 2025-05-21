const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./middleware/logger');
const rfidRoutes = require('./routes/rfid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});


app.use(bodyParser.json());
app.use(cors());
app.use(logger);
app.use('/rfid', rfidRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});