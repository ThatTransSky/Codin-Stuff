import { REST } from '@discordjs/rest'; // Required to communicate via HTTPS
import { Routes } from 'discord-api-types/v9'; //Required to communicate with Discord's API V9
import { Client, Collection } from 'discord.js';
import { CommandStructure } from '../classes/CommandStructure';
import { Config } from '../handlers/ConfigHandler.js';
// const { Collection } = require("discord.js")
import { config } from 'dotenv';
config();
/*
Event Name: "ready"
Event Triggers: When the bot is ready and has logged in.
Once: Yes
Event Arguments: 
- Client: The bot's client instance.
- Commands: A collection of commands (that are in ../commands/)
Event Results: Registers all global (none at the moment) and per-guild commands.
*/

export const name = 'ready',
  once = true;
export async function execute(client: Client, commands: Collection<string, CommandStructure>) {
  //When bot loads
  console.log(`Logged in as ${client.user.tag}!`);

  const client_id = client.user.id;
  const guilds = await client.guilds.fetch();
  guilds.forEach(async (guild) => {
    const fetchedGuild = await guild.fetch();
    // console.log(fetchedGuild);
    const config = new Config(fetchedGuild);
    await config.updateGuildInfo();
    console.log(`\nSuccessfully updated ${fetchedGuild.id}'s config with current info.\n`);
  });
  const rest = new REST({
    version: '10',
  }).setToken(process.env.TOKEN);
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
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
}
