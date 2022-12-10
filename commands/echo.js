const { SlashCommandBuilder } = require('@discordjs/builders');
/* 
Command Name: "echo"
Command Purpose: Receive a message and relay it back to the user.
Command Options (if any):
- Message (String Option, Required)
Checks (if any): None (Might add one in the future to sterilize the string, if that's a threat.)
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Echos your input')
    .addStringOption((option) =>
      option.setName('message').setDescription('The message to echo').setRequired(true),
    ),
  async execute(interaction) {
    interaction.reply({
      content: interaction.options.getString('message'),
      ephemeral: true,
    });
  },
};
