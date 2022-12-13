const { SlashCommandBuilder } = require('@discordjs/builders');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "untimeout"
Command Purpose: Removes a user's timeout.
Command Options (if any): 
- User (User Option, Required)
Required Permissions: MODERATE_MEMBERS (1 << 40)
Checks (if any): 
- Is the specified user not the same as triggering user?
- Is the specified user not the same as the bot?
- 
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription("Remove a user's timeout.")
    .setDefaultMemberPermissions(1 << 40)
    .addUserOption((option) => {
      return option
        .setName('user')
        .setDescription("The User who's timeout you wish to remove.")
        .setRequired(true);
    }),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    try {
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      // Funnels the provided options into variables.
      const specifiedUser = interaction.options.getUser('user');
      await guildMembers
        .fetch(specifiedUser)
        .then((specifiedGuildMember) => specifiedGuildMember.timeout(null));
      console.log(`Successfully removed ${specifiedUser.tag}'s timeout!`);
      return interaction.editReply({
        content: `Successfully removed ${specifiedUser}'s timeout!`,
      });
    } catch (err) {
      const errObject = new ErrorHandler(err.message, err.code, 'untimeout');
      if (errObject.shouldExit) {
        return await interaction.editReply({
          content: errObject.message,
          ephemeral: true,
        });
      } else console.log(errObject.message);
    }
  },
};
