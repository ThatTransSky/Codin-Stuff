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
    client.once(event.name, (...args) => event.execute(...args, commands))
  } else {
    client.on(event.name, (...args) => event.execute(...args, commands))
  }
}

client.on("messageCreate", msg => {
    // msg.content is the content of the message
    // msg.content.toLowerCase() is the content of the message but switched to lower case so you won't have to do ["Hi", "hI", "HI", "hi"]

    if (msg.content.toLowerCase() === 'hi') {
        // msg.reply replies to the message
        msg.reply(`Hello my name is @${client.user.tag}`) // Says "Hello my name is " and then the username of the bot
    }
})

client.login(process.env.TOKEN)