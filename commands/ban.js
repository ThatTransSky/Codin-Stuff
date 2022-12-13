const { SlashCommandBuilder } = require('@discordjs/builders');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "ban"
Command Purpose: Bans the specified user with a reason.
Command Options (if any): 
- User (User Object, Required)
- Reason (String Option, default: "No reason specified")
- DaysToDeleteMessages (Number Option, default: 0)
Required Permissions: BAN_MEMBERS (1 << 2)
Checks (if any): 
- Is the specified user not the same as the triggering user?
- Is the specified user not the same as the bot?
- Is the specified amount of days higher than the limit (7)?
- Is the specified user not higher in roles then the triggering user?
- Is the specified user not higher in roles than the bot?
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban') // Sets the name.
    .setDescription('Bans the specified user.') // Sets the description.
    .setDefaultMemberPermissions(1 << 2) // Sets the required permission.
    .addUserOption((option) => {
      // Adds a User Option
      return option.setName('user').setDescription('The user to ban.').setRequired(true);
    })
    .addStringOption((option) => {
      return option.setName('reason').setDescription('The reason for the ban.');
    })
    .addIntegerOption((option) => {
      return option
        .setName('delete_messages')
        .setDescription('The amount of days of messages to delete after banning. (Default is 0)');
    }),
  async execute(interaction) {
    // Executes the command.
    try {
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      // Defers the reply to this interaction to not timeout :)
      await interaction.deferReply({
        ephemeral: true,
      });
      // Funnels the provided options into variables.
      const specifiedUser = interaction.options.getUser('user');
      let reason = interaction.options.getString('reason', false);
      const guildBans = interaction.guild.bans;
      const deleteMessageSeconds = // I hate this specific case of auto-formatting >:(
        24 * 60 * 60 * interaction.options.getInteger('delete_messages', false); // Convert days to seconds. Required by Discord's API.
      if (deleteMessageSeconds > 604800) {
        // If the number of days are above the limit (7 or, in seconds, 607800),
        // end and notify the user.
        return interaction.editReply({
          content: `The amount of days specified is higher than the maximum of 7 days.\n
                    (Your input: \`${interaction.option.getInteger('delete_messages')}\`)`,
          ephemeral: true,
        });
      }
      if (reason == null) {
        reason = 'No reason provided.'; // If the reason was empty, replace it with "No reason provided."
      }

      try {
        await guildBans.create(specifiedUser, {
          deleteMessageSeconds: deleteMessageSeconds,
          reason: reason,
        });
      } catch (err) {
        const errObject = new ErrorHandler(err.message, err.code, 'ban');
        if (errObject.shouldExit) {
          return await interaction.editReply({
            content: errObject.message,
            ephemeral: true,
          });
        } else console.log(errObject.message);
      }
      console.log(
        `The user ${interaction.user.tag} (id: ${interaction.user.id}) has successfully banned ${specifiedUser.tag} (id: ${specifiedUser.id}) from ${interaction.guild.name} (id: ${interaction.guild.id}).`,
      );
      return await interaction
        .editReply({
          content: `Successfully banned ${specifiedUser}! (Reason: ${reason}).`,
        })
        .catch((error) => console.log(error));
    } catch (err) {
      const errObject = new ErrorHandler(err.message, err.code, 'ban');
      console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
    }
  },
};
