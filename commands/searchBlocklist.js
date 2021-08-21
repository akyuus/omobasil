const { SlashCommandBuilder } = require('@discordjs/builders');
const { interactionOptionsResolver } = require('../utils/interactionOptionsResolver.js');
const discord = require('discord.js');

/**
 * 
 * @param {discord.CommandInteraction} interaction 
 */
const searchBlocklist = async (interaction) => {
  const options = interactionOptionsResolver(interaction);
  const blocklist = interaction.client.cachedBlocklist;
  if(options.length < 1) {
    await interaction.reply('No arguments provided.');
    return;
  }

  const searchTerm = options[0].replace('@', '').toLowerCase();
  const userObj = blocklist.find(obj => obj.name.toLowerCase().startsWith(searchTerm));
  if(!userObj) {
    await interaction.reply(`Couldn't find anyone on the blocklist whose name starts with "${searchTerm}".`);
    return;
  }
  else {
    const replyString = discord.Formatters.blockQuote(`**@${userObj.name}** (id: ${userObj.id}) is on the blocklist.\n\n**Reason:** ${discord.Formatters.spoiler(userObj.reason)}`);
    await interaction.reply(replyString);
  }
}

const sblCommand = new SlashCommandBuilder()
  .setName('sbl')
  .setDescription('Searches the blocklist for a given user. Returns the first closest match.')
  .addStringOption(option => 
    option.setName('username')
    .setDescription('The user to search')
  );

module.exports = {
  data: sblCommand,
  execute: searchBlocklist
}