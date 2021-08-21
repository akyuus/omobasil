const discord = require('discord.js');

/**
 * 
 * @param {discord.CommandInteraction} interaction 
 */
const interactionOptionsResolver = (interaction) => {
  let optionsArray = interaction.options.data;
  if(optionsArray.length === 0) return [];
  optionsArray = optionsArray.map(option => option.value);
  return optionsArray;
}

module.exports = {
  interactionOptionsResolver
}