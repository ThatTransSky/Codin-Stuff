const { SlashCommandBuilder } = require('@discordjs/builders');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "timeout"
Command Purpose: Timeout a user in the guild for a specified amount of minutes.
Command Options (if any):
- User (User Option, Required)
- Duration in Minutes (Number Option, Required)
- Reason (String Option)
Required Permissions: MODERATE_MEMBERS (1 << 40)
Checks (if any):
- Is the specified user not the same as triggering user?
- Is the specified user not the same as the bot?
- Is the duration specified below the API limit? (20160 minutes//2 weeks)
- Is the specified user in the current guild?
- Does the specified user not have the Administrator permission?
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout') // Sets the name
    .setDescription('Time out a user') // Sets the description
    .setDefaultMemberPermissions(1 << 40) // Sets the required permissions
    // Adding the options
    .addUserOption((option) => {
      return option.setName('user').setDescription('The User to Timeout.').setRequired(true);
    })
    .addNumberOption((option) => {
      return option
        .setName('duration_in_minutes')
        .setDescription('How long should the timeout be? (in minutes)')
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option.setName('reason').setDescription('The reason for the timeout.');
    }),
  async execute(interaction) {
    try {
      await interaction.deferReply({
        ephemeral: true,
      });
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      // Funnels the provided options into variables.
      const specifiedUser = interaction.options.getUser('user');
      const duration = interaction.options.getNumber('duration_in_minutes') * 60 * 1000;
      // ^Converts Minutes into Milliseconds for Discord's API^.
      let reason = interaction.options.getString('reason');
      if (duration / 60 / 1000 > 20160) {
        // Discord (for some reason) decided the limit for how long a time out can be is 20160 minutes,
        // which is 2 weeks. The reason why it's bizarre is because their own built-in timeout command
        // doesn't even have 2 weeks as an option (and in the actual documented limit is 28 days >:( )
        return interaction.editReply({
          content: 'The duration provided is higher than the current limit! (Current limit: 20160)',
          ephemeral: true,
        });
      }
      if (reason == null) {
        reason = 'No reason provided.';
      }
      // const specifiedGuildMember = guildMembers.fetch
      await guildMembers
        .fetch(specifiedUser)
        .then((specifiedGuildMember) => specifiedGuildMember.timeout(duration, [reason]));
      console.log(`Successfully timed out ${specifiedUser.tag} for ${duration} milliseconds!`);
      return await interaction.editReply({
        content: `Successfully timed out ${specifiedUser} for ${
          duration / 60 / 1000
        } minutes! (Reason: ${reason})`,
      });
    } catch (err) {
      const errObject = new ErrorHandler(err, 'timeout');
      if (errObject.shouldExit) {
        return await interaction.editReply({
          content: errObject.message,
          ephemeral: true,
        });
      } else console.log(errObject.message);
    }
  },
};
