const { SlashCommandBuilder } = require('@discordjs/builders');
/*
Command Name: "kick"
Command Purpose: Like Ban but temporary :P
Command Options (if any): 
- User (User Object, Required)
- Reason (String Option, default: "No reason specified")
Required Permissions: BAN_MEMBERS (1 << 2)
Checks (if any): 
- Is the specified user not the same as the triggering user?
- Is the specified user not the same as the bot?
- Is the specified user not higher in roles then the triggering user?
- Is the specified user not higher in roles than the bot?
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick') // Sets the name.
    .setDescription('Kicks the specified user.') // Sets the description.
    .setDefaultMemberPermissions(1 << 2) // Sets the required permission.
    .addUserOption((option) => {
      // Adds the options.
      return option.setName('user').setDescription('The user to kick.').setRequired(true);
    })
    .addStringOption((option) => {
      return option.setName('reason').setDescription('The reason for the kick.');
    }),
  async execute(interaction) {
    // Executes the command.
    try {
      // Necessary constants
      const { client } = interaction;
      const guildMembers = interaction.guild.members;
      // Funnels the provided options into variables.
      let specifiedUser = interaction.options.getUser('user');
      const specifiedGuildMember = await guildMembers.fetch(specifiedUser).catch(() => {});
      // The .catch ^here^ is implemented to prevent the bot from crashing.
      // We don't need to handle the error at the moment cause it will be addressed later on in the code.
      let reason = interaction.options.getString('reason', false);

      if (interaction.user.equals(specifiedUser)) {
        // If the specified user = the triggering user, end and notify the user.
        return interaction.reply({
          content: "You can't kick yourself!",
          ephemeral: true,
        });
      } else if (client.user.equals(specifiedUser)) {
        return interaction.reply({
          content: "...*I'm sure you didn't mean that*...",
          ephemeral: true,
        });
      }
      try {
        // If the specified user is higher in the hierarchy than the triggering user, end and notify the user.
        if (
          interaction.member.roles.highest.comparePositionTo(specifiedGuildMember.roles.highest) <=
          0
        ) {
          // If the triggering user is higher in the hierarchy than the specified user, end and notify thg
          console.log(
            `${interaction.user.tag} has insufficient permissions to kick ${specifiedUser.tag}. (DiscordAPIError: MissionPermissions)`,
          );
          return interaction.reply({
            content: `The user ${specifiedUser} is at a higher (or equals) role than you and cannot be kicked by you.`,
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error("Couldn't check roles hierarchy, User isn't in the guild."); // Returning here is required because Discord.JS can't kick someone that isn't in the guild (unlike banning).
        return interaction.reply({
          content: 'The User is not currently in the Server and cannot be kicked.',
          ephemeral: true,
        });
      }
      if (reason == null) {
        reason = 'No reason provided.'; // If the reason was empty, replace it with "No reason provided."
      }

      await specifiedGuildMember.kick(reason).catch((error) => {
        // Kicks the specified user with the given reason (if any) and catch if there's an error.
        // console.log(error.code)
        if (error.code == 50013) {
          // if the error was "DiscordAPIError: Missing Permissions",
          if (!specifiedUser.manageable) {
            // check that the bot *can* manage the specified user and if not, end and notify the user.
            console.log(
              `The specified user ${specifiedUser.tag} is higher than the bot's role. (Staff member?)`,
            );
            return interaction.reply({
              content: `This user (${specifiedUser}) is higher than me in roles. Are you trying to kick a staff member?`,
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
        return;
      });
      if (!interaction.replied) {
        // checks that the interaction wasn't already replied to (in case one of the error conditions above were triggered).
        console.log(
          `The user ${interaction.user.tag}(id: ${interaction.user.id}) has successfully kicked ${specifiedUser.tag}(id: ${specifiedUser.id}) from ${interaction.guild.name}(id: ${interaction.guild.id}).`,
        );
        return interaction.reply({
          content: `The user ${specifiedUser} has been kicked for: ${reason}`,
        });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
