const { SlashCommandBuilder } = require("@discordjs/builders");
const { baseUrl } = require('../utils/scraper.js');

const getBlockListCommand = new SlashCommandBuilder()
  .setName('gbl')
  .setDescription('Gets the link to the current blocklist.');

module.exports = {
  data: getBlockListCommand,
  execute: async (interaction) => {
    await interaction.reply(baseUrl);
  }
}