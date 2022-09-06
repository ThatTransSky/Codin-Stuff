const { SlashCommandBuilder } = require("@discordjs/builders")

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