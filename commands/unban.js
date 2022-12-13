const { SlashCommandBuilder } = require('@discordjs/builders');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "unban"
Command Purpose: Removes a ban.
Command Options (if any):
- User_ID (User [cus discord is ̶s̶t̶u̶p̶i̶d̶  smart] Option, Required)
- Reason (String Option, Default: No reason provided.)
Required Permissions: BAN_MEMBERS (1 << 2)
Checks (if any):
- Is the User ID provided is valid and exists?
- Is the User ID provided the same as the Triggering User's ID?
- Is the User ID provided the same as the Bot's ID?
- Does the Guild have a ban associated with the User's ID?
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban') // Sets the name
    .setDescription('Removes a ban.') // Sets the description
    .setDefaultMemberPermissions(1 << 2) // Sets the required permissions (BAN_MEMBERS)
    .addUserOption((option) => {
      return option.setName('user').setDescription("Enter the User's ID.").setRequired(true);
    }),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    try {
      const { client } = interaction;
      // Funnels the provided options into variables.
      const specifiedUser = interaction.options.getUser('user');
      let reason = interaction.options.getString('reason', false);
      const guildBans = await interaction.guild.bans;
      if (reason == null) {
        reason = 'No reason provided.';
      }
      await guildBans.remove(specifiedUser, reason);
      console.log(`Successfully unbanned ${specifiedUser.tag} from ${interaction.guild.name}`);
      return await interaction.editReply({
        content: `Successfully unbanned ${specifiedUser}! :partying_face:`,
      });
    } catch (err) {
      const errObject = new ErrorHandler(err.message, err.code, 'unban');
      if (errObject.shouldExit) {
        return interaction.editReply({
          content: errObject.message,
          ephemeral: true,
        });
      } else console.log(errObject.message);
    }
  },
};
