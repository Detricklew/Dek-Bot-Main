function WordCount(str) { 
  return str.split(" ").length;
}
const fs = require('node:fs');
const path = require('node:path');
var log = require("./Load_discord.js");
const { token } = require("./config.json");
const { 
  Load_DB,
  Log_message,
  Load_Server,
  Log_Reaction,
  load_users,
  log_user,
  log_channel,
  Delete_message,
  Delete_reaction,
  delete_channel,
  check_responses
} = require("./Load_discord.js");
// Require the necessary discord.js classes
const {
  Client,
  Events,
  Collection,
  GatewayIntentBits,
  SlashCommandStringOption,
  Guild,
} = require("discord.js");
Load_DB();
// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  c.guilds.cache.forEach((server) => {
    Load_Server(server);
    load_users(server);
    server.channels.fetch().then((channel) => {
      channel.forEach((channel) => {
        log_channel(channel);
        if (channel.type == "0") {
          channel.messages
          .fetch({ limit:1 })
          .then(message =>{
            message.forEach(message =>{
              Log_message(message);
              message.reactions.cache.forEach(reaction =>{
                var messagereaction = reaction;
                reaction.users
                .fetch()
                .then(user =>{
                  user.forEach(user =>{
                    Log_Reaction(user.id, messagereaction);
                  })
                })
              })
            })
          })
          log.Load_Messages(channel);
        }
      });
    });
  });
});



client.on("messageCreate", async (message) => {
  Log_message(message);
  check_responses(message);
  const test = message.content.split(" ");
  console.log(WordCount(message.content));
  console.log(test);
});

client.on("messageDelete", async (message) =>{
  Delete_message(message);
  Delete_reaction(message.id);
})

client.on("messageUpdate", async (oldMessage, newMessage) =>{
  Log_message(newMessage);
})

client.on("messageReactionRemoveAll", (message, reactions) =>{
  console.log(message);
  console.log(reactions);
})

client.on("messageReactionAdd", async (MessageReaction, user) => {
  Log_Reaction(user.id, MessageReaction);
});

client.on("channelDelete", (channel) =>{
    delete_channel(channel);
})
client.on("channelCreate", (channel) =>{
  log_channel(channel);
})
client.on("channelUpdate", (channel, channel1) =>{
  log_channel(channel1);
})
client.on("guildMemberAdd", async (GuildMember) =>{
  log_user(GuildMember);
});


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Log in to Discord with your client's token
client.login(token);
