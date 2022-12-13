const { SlashCommandBuilder } = require('@discordjs/builders');
const ErrorHandler = require('../handlers/ErrorHandler');

/*
Command Name: "clear"
Command purpose: Clears messages in a channel with a specified amount.
Command Options:
- Amount (Integer Option, Required)
Required Permissions: MANAGE_MESSAGES (1 << 13)
Checks (if any):
- Is the amount an Integer? (deprecated since the option is Integer only but I'm paranoid so ¯\_(ツ)_/¯).
- Is the amount between 1-99? (99 is the limit with BulkDeletion)
Note: If the message deletion returns an unhandled error,
      I let the user know to contact me with that error code
      so I can see what went wrong and update the code.
*/

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear') // Sets the name.
    .setDescription(
      'Clears an amount of messages in the specified (or current) channel. Use with caution!',
    ) // Sets the description.
    .setDefaultMemberPermissions(1 << 13) // Sets the required permissions.
    .addIntegerOption((option) => {
      // Adds the options.
      return option
        .setName('amount')
        .setDescription('Amount of messages to delete. Between 1-99.')
        .setRequired(true); // Sets the option as required.
    })
    .addChannelOption((option) => {
      return option.setName('channel').setDescription('The Channel to clear the messages from.');
    }),
  async execute(interaction) {
    // Executes the command.
    const { client } = interaction;
    await interaction.deferReply({
      ephemeral: true,
    });
    try {
      // Funnels the provided options into variables.
      const Amount = interaction.options.getInteger('amount');
      let specifiedChannel = interaction.options.getChannel('channel', false);
      if (specifiedChannel === null) specifiedChannel = interaction.channel;
      if (!(0 < Amount < 100)) {
        // If the number is below 1 or above 99, end and notify the user.
        return await interaction.editReply({
          content: '**Please use a number between 1-99!**',
          ephemeral: true,
        });
      }
      try {
        const { size } = await specifiedChannel.bulkDelete(Amount); // Wait for the message deletion to complete and get the amount of messages deleted.
        return await interaction.editReply({
          content: `Successfully deleted ${size} messages!`,
          ephemeral: true,
        });
      } catch (err) {
        const errObject = new ErrorHandler(err.message, err.code, 'clear');
        if (errObject.shouldExit) {
          return await interaction.editReply({
            content: errObject.message,
            ephemeral: true,
          });
        } else console.log(errObject.message);
      }
    } catch (err) {
      const errObject = new ErrorHandler(err.message, err.code, 'clear');
      console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
    }
  },
};
