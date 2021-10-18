const discord = require('discord.js');
const updateChannels = ['878777893478600734', '769873397739421719', '877435590751191050'];
const axios = require('axios').default;
const baseUrl = `https://api.twitter.com/2/users`;
const fs = require('fs');
const path = require('path');
const colors = require('colors');
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
        "max_results": 8
      }
    });
  }
  catch(error) {
    console.error(error);
    return null;
  }

  try {
    let latestIds = response.data.data.map(el => el.id);
    /**
     * @type Object.<string, string>[]
     */
    let mediaTypes = response.data.includes.media;
    for(let i = latestIds.length - 1; i > -1; i--) {
      let latestId = latestIds[i];
      let attachments = response.data.data[i].attachments;
      let media_key = attachments ? attachments.media_keys[0] : null;
      let mediaType = media_key ? mediaTypes.find(mobj => mobj.media_key === media_key).type : "none";
      const isVideo = (mediaType === "video" || mediaType === "animated_gif");  
      let currentId = currentIds[twitterId];
      console.log(`Current ID on file: ${currentId}`.bold.red);
      console.log(`Latest ID retrieved: ${latestId}`.bold.red);
      if(parseInt(latestId) <= parseInt(currentId)) {
        console.log(`Tweet #${latestId} is not new.`);
        continue;
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
