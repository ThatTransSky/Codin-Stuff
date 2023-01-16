import { ErrorHandler } from '../handlers/ErrorHandler.js';
import {
  ChannelType,
  ChatInputCommandInteraction,
  GuildBasedChannel,
  SlashCommandBuilder,
} from 'discord.js';

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

export const data = new SlashCommandBuilder()
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
  });

export async function execute(interaction: ChatInputCommandInteraction) {
  // Executes the command.
  try {
    await interaction.deferReply({
      ephemeral: true,
    });
    // Funnels the provided options into variables.
    const client = interaction.client;
    const amount = interaction.options.getInteger('amount');
    let specifiedChannel = interaction.options.getChannel('channel', false) as GuildBasedChannel;
    if (specifiedChannel === null) specifiedChannel = interaction.channel;
    if (0! < amount && amount! < 100) {
      // If the number is below 1 or above 99, end and notify the user.
      return await interaction.editReply({
        content: '**Please use a number between 1-99!**',
      });
    }
    try {
      if (specifiedChannel.type !== ChannelType.GuildText) return;
      const { size } = await specifiedChannel.bulkDelete(amount); // Wait for the message deletion to complete and get the amount of messages deleted.
      return await interaction.editReply({
        content: `Successfully deleted ${size} messages!`,
      });
    } catch (err) {
      const errObject = new ErrorHandler(err, 'clear');
      if (errObject.shouldExit) {
        return await interaction.editReply({
          content: errObject.message,
        });
      } else console.log(errObject.message);
    }
  } catch (err) {
    const errObject = new ErrorHandler(err, 'clear');
    console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
  }
}
