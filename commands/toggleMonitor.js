const discord = require('discord.js');
const { updateMonitoredChannels } = require('../utils/monitoredChannels.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

let monitoredChannels = require('../utils/monitoredChannels.json');

/**
 * 
 * @param {discord.CommandInteraction} interaction 
 */
const toggleMonitor = async (interaction) => {
  const perms = interaction.member.permissions;
  const hasManageChannels = perms.has("MANAGE_CHANNELS");
  const isOwner = interaction.member.id;
  if(!hasManageChannels && !isOwner) {
    await interaction.reply('You need the "Manage Channels" permission to call this.');
    return;
  }
  currentCount = monitoredChannels.length;
  monitoredChannels = updateMonitoredChannels(interaction.channel.id);
  if(currentCount < monitoredChannels.length) {
    await interaction.reply(`Added <#${interaction.channel.id}> to the list of monitored channels.`);
  }
  else {
    await interaction.reply(`Removed <#${interaction.channel.id}> from the list of monitored channels.`);
  }
}

const toggleCommand = new SlashCommandBuilder()
  .setName('toggle')
  .setDescription('Toggles whether or not this channel is monitored for those on the blocklist.');

module.exports = {
  data: toggleCommand,
  execute: toggleMonitor
}
