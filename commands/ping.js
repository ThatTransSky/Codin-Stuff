const { SlashCommandBuilder } = require("@discordjs/builders")
/*
Command Name: "ping"
Command Purpose: Checks that the bot is alive and well.
Command Options (if any): None
Checks (if any): None
Note: If you find THIS command confusing, how?
*/
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pong!"),
    async execute(interaction) {
        //console.log(interaction)
        interaction.reply({
            content: "Pong!",
            ephemeral: true,
        })
    }
}