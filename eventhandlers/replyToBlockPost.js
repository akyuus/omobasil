const discord = require('discord.js');
const { getMonitoredChannels } = require('../utils/monitoredChannels.js');
let monitoredChannels = require('../utils/monitoredChannels.json');

/**
 * 
 * @param {discord.Message} message 
 * @param {string} blockedUser
 */
const replyToBlockPost = async (message, blockedUser) => {
  const posterName = message.member.displayName;
  const replyString = `⚠️ You appear to have posted content from a user on the blocklist, ${posterName}.\n
  **${blockedUser.name}** is on the blocklist.
  **Reason:** ${discord.Formatters.spoiler(blockedUser.reason)}
  `
  const blockQuote = discord.Formatters.blockQuote(replyString);
  await message.reply(blockQuote)
}

/**
 * 
 * @param {discord.Message} message 
 */
const parseMessage = (message) => {
  monitoredChannels = getMonitoredChannels();
  console.log(monitoredChannels);
  if(!monitoredChannels.includes(message.channel.id)) return;
  
  const regex = new RegExp(String.raw`.*https://twitter.com/(?<username>\w+)/.*`)
  const content = message.content;
  const match = regex.exec(message.content);
  
  if(!match) return;
  
  const blocklist = message.client.cachedBlocklist;
  const username = match.groups.username;
  const blockedUser = blocklist.find(userObj => userObj.name === username);
  if(blockedUser) {
    replyToBlockPost(message, blockedUser);
  }
  return;
}

module.exports = {
  parseMessage
}