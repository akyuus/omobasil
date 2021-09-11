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
        "exclude": "retweets,replies",
        "expansions": "attachments.media_keys",
        "media.fields": "type",
        "max_results": 40
      }
    });
  }
  catch(error) {
    console.error(error);
    return null;
  }

  console.log(response);
  try {
    let latestIds = [response.data.data[0].id, response.data.data[1].id, response.data.data[2].id];
    let mediaTypes = [response.data.includes.media[0].type, response.data.includes.media[1].type, response.data.includes.media[2].type];
    for(let i = 0; i < latestIds.length; i++) {
      let latestId = latestIds[i];
      let mediaType = mediaTypes[i];
      const isVideo = (mediaType === "video" || mediaType === "animated_gif");  
      let currentId = currentIds[twitterId];
      if(latestId === currentId) {
        console.log('No new tweets.');
        return null;
      }
      else {
        console.log(`There's a new tweet!`);
        currentIds[twitterId] = latestId;
        fs.writeFileSync(path.join(__dirname, 'latestId.json'), JSON.stringify(currentIds));
        postTweet(client, twitterId, latestId, isVideo);
      }   
    }
  }
  catch(error) {
    console.error(error);
    console.log(response);
    return;
  }
}

/**
 * 
 * @param {discord.Client} client 
 */
const postTweet = async (client, twitterId, tweetId, isVideo=false) => {
  let response = null;
  try {
    response = await axios.get(`https://api.twitter.com/2/users/${twitterId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      },
    });
  }
  catch(error) {
    console.error(error);
    return;
  }

  const username = response.data.data.username;
  let tweetLink = `https://twitter.com/${username}/status/${tweetId}`;
  if(isVideo) {
    tweetLink = `https://fxtwitter.com/${username}/status/${tweetId}`;
  }
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
