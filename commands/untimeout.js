const { SlashCommandBuilder } = require('@discordjs/builders');
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
      return option.setName('user').setDescription('The User to Timeout.').setRequired(true);
    }),
  async execute(interaction) {
    try {
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      // Funnels the provided options into variables.
      const specifiedUser = interaction.options.getUser('user');
      const specifiedGuildMember = await guildMembers.fetch(specifiedUser).catch(() => {});
      // The .catch ^here^ is implemented to prevent the bot from crashing.
      // We don't need to handle the error at the moment cause it will be addressed later on in the code.

      if (interaction.user.equals(specifiedUser)) {
        // If specified user = triggering user, end and notify the user.
        return interaction.reply({
          content: "You're not timed out. :/",
          ephemeral: true,
        });
      } else if (client.user.equals(specifiedUser)) {
        // *sigh*
        return interaction.reply({
          content: "I'm not timed out... :|",
          ephemeral: true,
        });
      }

      try {
        // If the specfied user is higher in the hierarcy than the triggering user, end and notify the user.
        if (
          interaction.member.roles.highest.comparePositionTo(specifiedGuildMember.roles.highest) <=
          0
        ) {
          console.log(
            `${interaction.user.tag} has insufficent permissions to kick ${specifiedUser.tag}. (DiscordAPIError: MissionPermissions)`,
          );
          return interaction.reply({
            content: `The user ${specifiedUser} is at a higher (or equals) role than you and their time out status cannot be changed by you.`,
            ephemeral: true,
          });
        }
      } catch (error) {
        // It's necessary that we reply and end the command here because timeout requires the user to be in the server.
        console.error("Couldn't check roles hierarcy, User isn't in the Guild.");
        return interaction.reply({
          content: "This User is not currently in the Server and therefor, isn't timed out.",
          ephemeral: true,
        });
      }

      await specifiedGuildMember.timeout(null).catch((error) => {
        // If the error was "Mission Permissions", check that the specified user is manageable by the bot.
        if (error.code == 50013) {
          if (!specifiedGuildMember.manageable) {
            console.log(
              `The specified user ${specifiedUser.tag} is higher in roles than the bot. (Staff member?)`,
            );
            return interaction.reply({
              content: `The specified user (${specifiedUser.tag}) is higher than me in the hierarcy and their timeout status cannot be changed by me.`,
              ephemeral: true,
            });
          }
        } else {
          console.log(error.message);
          return interaction.reply({
            content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(
              process.env.CREATOR_ID,
            )}) (Error message: ${error.message}))`,
            ephemeral: true,
          });
        }
      });

      if (!interaction.replied) {
        console.log(`Successfully removed ${specifiedUser.tag}'s time out!`);
        return interaction.reply({
          content: `Successfully removed ${specifiedUser}'s timeout!`,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
