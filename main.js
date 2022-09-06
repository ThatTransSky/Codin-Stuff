const { Client, Intents, VoiceChannel, Message, MessageEmbed, MessageAttachment, DiscordAPIError, Collection, Interaction, } = require('discord.js'); 
const fs = require("fs");
const client = new Client({
   intents: [
     Intents.FLAGS.GUILDS, 
     Intents.FLAGS.GUILD_MESSAGES, 
     Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
     Intents.FLAGS.GUILD_PRESENCES, 
     Intents.FLAGS.GUILD_BANS, 
     Intents.FLAGS.GUILD_MEMBERS,
    ]
  });
require('dotenv/config')

let bot = {
  client,
  owners: ["232936279384260609"]
}

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))

const commands = []

client.commands = new Collection()

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
  client.commands.set(command.data.name, command)
}


const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`)

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, commands))// Runs the "run-once" events.
  } else {
    client.on(event.name, (...args) => event.execute(...args, commands))// Runs the rest of the events.
  }
}

client.login(process.env.TOKEN)