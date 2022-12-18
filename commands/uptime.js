let { SlashCommandBuilder } = require('@discordjs/builders');
/* 
Command Name: "uptime"
Command Purpose: Show the bot's current uptime.
Command Options (if any): None
Checks (if any): None
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Shows how long have the bot been online for.'),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const { client } = interaction;
    const date = client.readyAt;

    const rawTimestamp = Math.floor(client.readyAt / 1000);
    const uptimeTimestamp = `<t:${rawTimestamp}:R>`;

    return interaction.editReply({
      content: `I was last online ${uptimeTimestamp}.`,
    });
  },
};
