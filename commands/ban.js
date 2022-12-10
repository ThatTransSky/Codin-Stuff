const { SlashCommandBuilder } = require('@discordjs/builders');
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
      // Adds the options.
      return option.setName('user').setDescription('The user to ban.').setRequired(true);
    })
    .addStringOption((option) => {
      return option.setName('reason').setDescription('The reason for the ban.');
    })
    .addIntegerOption((option) => {
      return option
        .setName('delete_messages')
        .setDescription('The amount of days of messages to delete after banning.');
    }),
  async execute(interaction) {
    // Executes the command.
    try {
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      // Funnels the provided options into variables.
      const specifiedUser = interaction.options.getUser('user');
      const specifiedGuildMember = await guildMembers.fetch(specifiedUser).catch(() => {});
      // The .catch ^here^ is implemented to prevent the bot from crashing.
      // We don't need to handle the error at the moment cause it will be addressed later on in the code.
      let reason = interaction.options.getString('reason', false);
      const guildBans = interaction.guild.bans;
      const deleteMessageSeconds =
        24 * 60 * 60 * interaction.options.getInteger('delete_messages', false); // Convert days to seconds. Required by Discord's API.

      if (interaction.user.equals(specifiedUser)) {
        // If the specified user = the triggering user, end and notify the user.
        return interaction.reply({
          content: "You can't ban yourself!",
          ephemeral: true,
        });
      } else if (client.user.equals(specifiedUser)) {
        // How dare you target the bot?
        return await interaction.reply({
          content:
            "Did... did you just try to ban me using my command? Sorry to let you down but that's not how it works, I can't ban myself.",
          ephemeral: true,
        });
      } else if (deleteMessageSeconds > 604800) {
        // If the number of days are above the limit (7 or, in seconds, 607800),
        // end and notify the user.
        return interaction.reply({
          content: `The amount of days specified is higher than the maximum of 7 days.
                    (Your input: \`${deleteMessageSeconds / 24 / 60 / 60}\`)`,
          ephemeral: true,
        });
      }
      try {
        // If the specified user is higher in the hierarchy than the triggering user, end and notify the user.
        if (
          interaction.member.roles.highest.comparePositionTo(specifiedGuildMember.roles.highest) <=
          0
        ) {
          console.log(
            `${interaction.user.tag} has insufficient permissions to kick ${specifiedUser.tag}. (DiscordAPIError: MissionPermissions)`,
          );
          return interaction.reply({
            content: `The user ${specifiedUser} is at a higher (or equals) role than you and cannot be banned by you.`,
            ephemeral: true,
          });
        }
      } catch (error) {
        // No need to return here since it is possible to create a ban for a user that isn't in the guild (unlike kicking).
        console.error("Couldn't check roles hierarchy, User isn't in the Guild.");
      }
      if (reason == null) {
        reason = 'No reason provided.'; // If the reason was empty, replace it with "No reason provided."
      }

      await guildBans
        .create(specifiedUser, {
          days: null,
          deleteMessageSeconds: deleteMessageSeconds,
          reason: reason,
        })
        .catch((error) => {
          // Ban the specified user with the given days and reason (if any) and catch if there's an error.
          // console.log(error.code)
          if (error.code == 50013) {
            // if the error was "DiscordAPIError: Missing Permissions",
            if (!specifiedUser.manageable) {
              // check that the bot *can* manage the specified user and if not, end and notify the user.
              console.log(
                `The specified user ${specifiedUser.tag} is higher than the bot's role. (Staff member?)`,
              );
              return interaction.reply({
                content: `This user (${specifiedUser}) is higher than me in roles. Are you trying to ban a staff member?`,
                ephemeral: true,
              });
            } else {
              console.log(error.message);
              return interaction.reply({
                content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(
                  process.env.CREATOR_ID,
                )}) (Error message: ${error.message}))`,
                ephemeral: true,
              });
            }
          }
          return;
        });
      if (!interaction.replied) {
        // checks that the interaction wasn't already replied to (in case one of the error conditions above were triggered).
        console.log(
          `The user ${interaction.user.tag}(id: ${interaction.user.id}) has successfully banned ${specifiedUser.tag}(id: ${specifiedUser.id}) from ${interaction.guild.name}(id: ${interaction.guild.id}).`,
        );
        return interaction
          .reply({
            content: `Successfully banned ${specifiedUser}! (Reason: ${reason}).`,
          })
          .catch((error) => console.log(error));
      }
    } catch (err) {
      console.log(err);
    }
  },
};
