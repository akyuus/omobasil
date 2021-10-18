const axios = require('axios').default;
const cheerio = require('cheerio');
const baseUrl = `https://omoriblockdef.carrd.co/#blocklist`; 
const twitterUrl = `https://api.twitter.com/2/users/by/username`
const twitterToken = process.env.TWITTER_BEARER_TOKEN;
const path = require('path');
const blocklistPath = path.join(__dirname, 'blocklist.json');
const fs = require('fs');

let blocklist = [];

const getTwitterIdFromUsername = async (name) => {
  try {
    response = await axios.get(`${twitterUrl}/${name}`, {
      headers: {
        Authorization: `Bearer ${twitterToken}`,
      },
    });
    
    return response.data.data.id;
  }
  catch(error) {
    console.log('probably being rate limited');
    return "N/A";
  }
}

const updateBlocklist = async () => {
  let rawHtml = "";
  if(fs.existsSync(blocklistPath)) {
    blocklist = JSON.parse(fs.readFileSync(blocklistPath, { encoding: 'utf-8' }));
  }

  try {
    rawHtml = (await axios.get(baseUrl)).data;
  }
  catch(error) {
    console.log(error);
    return null;
  }

  const $ = cheerio.load(rawHtml);
  let currentBlocklist = [];
  const table = $("table tbody", ".table-inner")
    .children()
    .each(async (i, tr) => {
      const names = $(tr).children().eq(0).text().split(' ');
      const reason = $(tr).children().eq(1).text();
      names.forEach((name) => {
        name = name.replace('@', '');
        currentBlocklist.push({ name: name, reason: reason });
      });
    });

    // remove users that aren't on the blocklist anymore
    blocklist = blocklist.filter(user => currentBlocklist.some(curr => user.name === curr.name));
    // add new users
    currentBlocklist.forEach(user => {
      if(!blocklist.some(oldUser => oldUser.name === user.name)) {
        blocklist.push(user);
      }
    });
    
    for(let blockedUser of blocklist) {
      if(blockedUser.id && blockedUser.id != "N/A") continue;
      else {
        blockedUser.id = await getTwitterIdFromUsername(blockedUser.name);
      }
    }

    fs.writeFileSync(blocklistPath, JSON.stringify(blocklist));
    return blocklist;
}

module.exports = {
  blocklist,
  updateBlocklist,
  baseUrl
}
