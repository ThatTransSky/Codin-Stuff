const { SlashCommandBuilder } = require('@discordjs/builders');
/*
Command Name: "unban"
Command Purpose: Revokes a user ban.
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
    .setDescription('Revokes a user ban.') // Sets the description
    .setDefaultMemberPermissions(1 << 2) // Sets the required permissions (BAN_MEMBERS)
    .addUserOption((option) => {
      return option.setName('user_id').setDescription("Enter the User's ID.").setRequired(true);
    })
    .addUserOption((option) => {
      return option.setName('reason').setDescription('The Reason for Unbanning.');
    }),
  async execute(interaction) {
    try {
      const { client } = interaction;
      // Funnels the provided options into variables.
      const specifiedUser = await client.users
        .fetch(interaction.options.getUser('user_id'))
        // ̶^̶T̶h̶i̶s̶^̶ ̶c̶o̶u̶l̶d̶ ̶v̶e̶r̶y̶ ̶e̶a̶s̶i̶l̶y̶ ̶b̶e̶ ̶r̶e̶p̶l̶a̶c̶e̶d̶ ̶w̶i̶t̶h̶ ̶g̶e̶t̶U̶s̶e̶r̶ ̶a̶n̶d̶ ̶l̶e̶t̶ ̶D̶i̶s̶c̶o̶r̶d̶ ̶h̶a̶n̶d̶l̶e̶ ̶t̶h̶e̶ ̶e̶r̶r̶o̶r̶.̶  Done.
        .catch((error) => {
          console.log(error.message);
          return interaction.reply({
            content: `An unhandled error has occurred. Please let my creator know! (${client.users.fetch(
              process.env.CREATOR_ID,
            )}) (Error message: ${error.message}))`,
            ephemeral: true,
          });
        });
      let reason = interaction.options.getString('reason', false);
      const guildBans = await interaction.guild.bans;

      if (reason == null) {
        reason = 'No reason provided.';
      }

      if (interaction.user.id === specifiedUser.id) {
        // If the specified user = triggering user, end and notify the user.
        return interaction.reply({
          content:
            "The user provided isn't--- Wait... You didn't really just try to unban yourself? *sigh* :person_facepalming:",
          ephemeral: true,
        });
      } else if (client.user.id === specifiedUser.id) {
        // You're talking to the bot, why did you think the bot's banned?
        return interaction.reply({
          content: "Hello? I'm- I'm right here. I'm not banned, am I?",
          ephemeral: true,
        });
      } else {
        await guildBans
          .remove(specifiedUser, reason)
          // If the unban errors here, it is most likely due to the user never having a ban.
          .catch((error) => {
            console.log(error.message);
            return interaction.reply({
              content: `There was an error unbanning this user. Are you sure the user is banned? (Error Message: ${error.message})`,
              ephemeral: true,
            });
          });
      }
      if (!interaction.replied) {
        console.log(`Successfully unbanned ${specifiedUser.tag} from ${interaction.guild.name}`);
        return interaction.reply({
          content: `Successfully unbanned ${specifiedUser}! :partying_face:`,
        });
      }
    } catch (error) {
      console.log(error.message);
      return;
    }
  },
};
