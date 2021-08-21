const discord = require('discord.js');
const basilQuotesId = '1394717331255820289';
const updateChannel = process.env.NODE_ENV === "production" ? '855610710583148609' : '769873397739421719';
const axios = require('axios').default;
const baseUrl = `https://api.twitter.com/2/users/${basilQuotesId}/tweets`
const fs = require('fs');
const path = require('path');
let id = require('./latestId.json').id;

const getLatestTweet = async () => {
  console.log('Getting latest tweet...');
  const response = await axios.get(baseUrl, {
    headers: {
      'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
    },
    params: {
      exclude: "retweets,replies",
      max_results: 5
    }
  });

  const latestId = response.data.data[0].id;
  console.log(`IDS:\nid:\t${id}\nlatestId:\t${latestId}`);
  if(latestId === id) {
    console.log('No new tweets.');
    return null;
  }
  else {
    console.log(`There's a new tweet!`);
    id = latestId;
    fs.writeFileSync(path.join(__dirname, 'latestId.json'), JSON.stringify({ id: id }));
    return latestId;
  }
}

/**
 * 
 * @param {discord.Client} client 
 */
const postTweet = async (client) => {
  const tweetLink = `https://twitter.com/${basilQuotesId}/status/${id}`;
  await client.channels.cache.get(updateChannel).send(tweetLink);
}

module.exports = {
  getLatestTweet,
  postTweet
}