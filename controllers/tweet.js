require("dotenv").config();
const { twitterClient } = require("../utils/twitterClient");
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs').promises;

const post_tweet = async (message, file) => {
    try {
        let mediaId;
        if (file) {
            const media = await twitterClient.v1.uploadMedia(file.path);
            mediaId = media;
            // Unlink the file after successful upload
            await fs.unlink(file.path);
        }

        let res;
        if (mediaId) {
            res = await twitterClient.v2.tweet({
                text: message,
                media: { media_ids: [mediaId] },
            });
        } else {
            res = await twitterClient.v2.tweet({
                text: message,
            });
        }
        return res;
    } catch (e) {
        console.error('Error tweeting:', e);
        throw e;
    }
}

const fetchQuote = async () => {
    try {
        const response = await axios.get('https://api.api-ninjas.com/v1/quotes?category=morning', {
            headers: {
                'X-Api-Key': process.env.QUOTES_API_KEY
            }
        });
        if (response.data && response.data.length > 0) {
            const quoteData = response.data[0];
            return `${quoteData.quote} \n - ${quoteData.author} \n\n[automated]`;
        }
        return "Good morning! Have a great day!";
    } catch (error) {
        console.error('Error fetching quote:', error);
        return "Good morning! Have a great day!";
    }
}

const tweetDailyQuote = async () => {
    const quote = await fetchQuote();
    await post_tweet(quote);
}



module.exports = {tweetDailyQuote,post_tweet};
