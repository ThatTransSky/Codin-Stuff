const { REST } = require("@discordjs/rest") // Required to communicate via HTTPS
const { Routes } = require("discord-api-types/v9") //Required to communicate with Discord's API V9
// const { Collection } = require("discord.js")
require("dotenv").config()

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
    name: "ready",
    once: true,
    execute (client, commands) {
        //When bot loads
        console.log(`Logged in as ${client.user.tag}!`)
        
        const CLIENT_ID = process.env.CLIENT_ID

        /* Still working on this but it's disabled for now.
        
        client.slashcommands = new Collection()

        client.loadSlashCommands = (bot, reload) => require("./handlers/SlashCommands")
        client.loadSlashCommands(bot, false)
        
        */
        const rest = new REST({
        version: "9"
        }).setToken(process.env.TOKEN);

        (async () => {
        try {
            // Since the bot is custom made & private for The Pathetic Server™, this should never trigger.
            if (process.env.ENV === "Production") {
            await rest.put(Routes.applicationCommands(CLIENT_ID), {
                body: commands
            })
            console.log("Seccessfully registered commands globaly.");
            } else { // Registers the commands locally (per-guild). Set to the Test Server for now.
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), {
                body: commands
            })
            console.log("Seccessfully registered commands locally.");
            }
        } catch (err) {
            if (err) console.error(err);
        }
        })();
    }
}