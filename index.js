const express = require('express');
const multer = require('multer');
const path = require('path');
const {post_tweet,tweetDailyQuote} = require('./controllers/tweet');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT

app.use(express.json());

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Schedule the cron job to run daily at 2:35 PM IST
cron.schedule('50 15 * * *', () => {
    tweetDailyQuote();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

app.post('/api/tweet/post/', upload.single('media'), async (req, res) => {
    const { message } = req.body;
    const file = req.file;

    try {
        const response = await post_tweet(message, file);
        console.log(`Message: ${message}, File: ${file ? file.filename : 'No file uploaded'}`);
        res.status(200).send(response);
    } catch (error) {
        console.error('Error posting tweet:', error);
        res.status(500).send('Failed to post tweet');
    }
});

app.listen(5001, (err) => {
    if (err) {
        console.error('Server failed to start:', err);
    } else {
        console.log(`Server is running on port `+PORT);
    }
});
