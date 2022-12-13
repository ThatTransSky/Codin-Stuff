const { SlashCommandBuilder } = require('@discordjs/builders');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "check-timeout"
Command Purpose: Replys with the specified user's timeout status.
Command Options (if any): 
Required Permissions: MODERATE_MEMBERS (1 << 40)
Checks (if any): 
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-timeout') // Sets the name
    .setDescription("Checks a user's timeout status (if timed out at all).") // Sets the description
    .setDefaultMemberPermissions(1 << 40) // Sets the required permissions (MODERATE_MEMBERS)
    .addUserOption((option) => {
      return option.setName('user').setDescription('The User to check.').setRequired(true);
    }),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    try {
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      const specifiedUser = interaction.options.getUser('user');
      const specifiedGuildMember = await guildMembers.fetch(specifiedUser);
      if (specifiedGuildMember.isCommunicationDisabled()) {
        const timeoutTimestamp = specifiedGuildMember.communicationDisabledUntil;
        return await interaction.editReply({
          content: `${specifiedUser} is timed out until ${timeoutTimestamp}.`,
          ephemeral: true,
        });
      } else {
        return await interaction.editReply({
          content: `${specifiedUser} isn't currently timed out.`,
          ephemeral: true,
        });
      }
    } catch (err) {
      const errObject = new ErrorHandler(err.message, err.code, 'check_timeout');
      if (errObject.shouldExit) {
        return await interaction.editReply({
          content: errObject.message,
          ephemeral: true,
        });
      } else console.log(errObject.message);
    }
  },
};
