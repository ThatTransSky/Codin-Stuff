const { SlashCommandBuilder } = require("@discordjs/builders")
/* 
Command Name: "uptime"
Command Purpose: Show the bot's current uptime.
Command Options (if any): None
Checks (if any): None
*/
module.exports = {
    data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Shows how long have the bot been online for."),
    async execute(interaction, client) {
        return interaction.reply({
            content: "This command is a WIP.",
            epheremal: true,
        })
    } 
}