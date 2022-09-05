const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears the entire chat. Use with caution!"),
    async execute(client, interaction) {
        if(!interaction.user.permissions.has("MANAGE_MESSAGES"))
        return interaction.reply({
            content: "You don't have the required permissions to use this command.",
            ephemeral: true,
        })

        if(!interaction.guild.me.permissions.has("MANAGE_MESSAGES"))
        return interaction.reply({
            content: "I don't have the required permissions to use this.",
            ephemeral: true,
        })
    }
}