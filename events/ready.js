const { REST } = require('@discordjs/rest'); // Required to communicate via HTTPS
const { Routes } = require('discord-api-types/v9'); //Required to communicate with Discord's API V9
const ConfigFile = require('../handlers/ConfigHandler');
// const { Collection } = require("discord.js")
require('dotenv').config();

/*
Event Name: "ready"
Event Triggers: When the bot is ready and has logged in.
Once: Yes
Event Arguments: 
- Client: The bot's client instance.
- Commands: A collection of commands (that are in ../commands/)
Event Results: Registers all global (none at the moment) and per-guild commands.
*/

module.exports = {
  name: 'ready',
  once: true,
  async execute(client, commands) {
    //When bot loads
    console.log(`Logged in as ${client.user.tag}!`);

    const client_id = client.user.id;
    const guilds = await client.guilds.fetch();
    guilds.forEach((guild) => {
      guild = client.guilds.resolve(guild.id);
      const config = new ConfigFile('guild', guild);
      config.updateGuildInfo();
      console.log(`\nSuccessfully updated ${guild.id}'s config with current info.\n`);
    });

    /* Still working on this but it's disabled for now.
        
        client.slashcommands = new Collection()

        client.loadSlashCommands = (bot, reload) => require("./handlers/SlashCommands")
        client.loadSlashCommands(bot, false)
        
        */
    const rest = new REST({
      version: '9',
    }).setToken(process.env.TOKEN);
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    console.log(guild);
    (async () => {
      try {
        if (process.env.ENV === 'Production') {
          await rest.put(Routes.applicationCommands(client_id), {
            body: commands,
          });
          console.log('Seccessfully registered commands globaly.');
        } else {
          // Registers the commands locally (per-guild). Set to the Test Server for now.
          await rest.put(Routes.applicationGuildCommands(client_id, guild.id), {
            body: commands,
          });
          console.log(`Seccessfully registered commands in '${guild.name}'.`);
          // Code below is for registering every in command in *every* guild. Disabled to avoid limits.
          // guilds.forEach(async (guild) => {
          //   await rest.put(Routes.applicationGuildCommands(client_id, guild.id), {
          //     body: commands,
          //   });
          //   console.log(`Seccessfully registered commands in '${guild.name}'.`);
          // });
        }
      } catch (err) {
        if (err) console.error(err);
      }
    })();
  },
};
