const discord = require('discord.js');
const updateChannels = ['878777893478600734', '769873397739421719', '877435590751191050'];
const axios = require('axios').default;
const baseUrl = `https://api.twitter.com/2/users`;
const fs = require('fs');
const path = require('path');
let currentIds = require('./latestId.json');

/**
 * 
 * @param {discord.Client} client 
 * @param {String} twitterId
 * @returns 
 */
const getLatestTweet = async (client, twitterId) => {
  console.log('Getting latest tweet...');
  let response = null;
  try {
    response = await axios.get(`${baseUrl}/${twitterId}/tweets`, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      },
      params: {
        exclude: "retweets,replies",
        max_results: 5
      }
    });
  }
  catch(error) {
    console.error(error);
    return null;
  }

  const latestId = response.data.data[0].id;
  let currentId = currentIds[twitterId];
  if(latestId === currentId) {
    console.log('No new tweets.');
    return null;
  }
  else {
    console.log(`There's a new tweet!`);
    currentIds[twitterId] = latestId;
    fs.writeFileSync(path.join(__dirname, 'latestId.json'), JSON.stringify(currentIds));
    postTweet(client, twitterId, latestId);
  }
}

/**
 * 
 * @param {discord.Client} client 
 */
const postTweet = async (client, twitterId, tweetId) => {
  const tweetLink = `https://twitter.com/${twitterId}/status/${tweetId}`;
  for(let updateChannel of updateChannels) {
    try {
      await client.channels.cache.get(updateChannel).send(tweetLink);
    }
    catch (error) {
      console.log('Failed to send tweet in channel.');
      console.error(error);
      continue;
    }
  }
}

module.exports = {
  getLatestTweet,
  postTweet
}