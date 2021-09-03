require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');
const { blocklist, updateBlocklist, writeBlocklistToFile } = require('./utils/scraper.js');
const fs = require('fs');
const colors = require('colors');
const path = require('path');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'))
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const replies = require('./eventhandlers/replyToBlockPost.js');
const { getLatestTweet, postTweet } = require('./utils/basilQuotes.js');
client.commands = new Collection();
const jsonCommands = [];
const serverIds = ['769873397739421716', '855610710583148604'] 
const accountIds = ['1394717331255820289', '1325549510135861248'];
const applicationId = '877432418284486656';

for(const file of commandFiles) {
  const commandModule = require(`./commands/${file}`);
  jsonCommands.push(commandModule.data.toJSON());
  client.commands.set(commandModule.data.name, commandModule);
}

const rest = new REST({ version: 9 }).setToken(process.env.token);

(async () => {
  for(let serverId of serverIds) {
    try {
      console.log(`Re-initializing slash commands in ${serverId}...`);
      await rest.put(
        Routes.applicationGuildCommands(applicationId, serverId),
        { body: jsonCommands }
      )
      console.log('Initialized slash commands.');
    }
    catch(error) {
      console.error(error);
    }  
  }
})();

client.on('interactionCreate', async (interaction) => {
  if(!interaction.isCommand()) return;

  const { commandName } = interaction;

  if(!client.commands.get(commandName)) return;
  try {
    client.commands.get(commandName).execute(interaction);    
  }
  catch(error) {
    console.log(error);
    interaction.reply({ content: 'Something went wrong. Whoops.', ephemeral: true });
  }
})

client.on('messageCreate', (message) => {
  if(message.member.user.bot) return;
  replies.parseMessage(message);
  return;
})

client.once('ready', async () => {
  console.log('List of servers:\n'.red.bold);
  if(process.env.NODE_ENV="production") console.log("RUNNING IN PRODUCTION MODE".green.bold);
  const guilds = Array.from(client.guilds.cache.values());
  client.guilds.cache.forEach((guild, key) => console.log(`-- ${guild.name}\n`));
  client.cachedBlocklist = await updateBlocklist();
  client.user.setActivity('plants grow', { type: 'WATCHING' });
});

client.login(process.env.token);

setInterval(async () => {
  client.cachedBlocklist = await updateBlocklist();
}, 60000);

setInterval(async () => {
  for(let accountId of accountIds) {
    await getLatestTweet(client, accountId);
  }
}, 180000)