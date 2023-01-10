import { SlashCommandBuilder } from '@discordjs/builders';
import { ErrorHandler } from '../handlers/ErrorHandler.js';
import { ChatInputCommandInteraction } from 'discord.js';
/*
Command Name: "check-timeout"
Command Purpose: Replys with the specified user's timeout status.
Command Options (if any): 
Required Permissions: MODERATE_MEMBERS (1 << 40)
Checks (if any): 
*/
export const data = new SlashCommandBuilder()
  .setName('check-timeout') // Sets the name
  .setDescription("Checks a user's timeout status (if timed out at all).") // Sets the description
  .setDefaultMemberPermissions(1 << 40) // Sets the required permissions (MODERATE_MEMBERS)
  .addUserOption((option) => {
    return option.setName('user').setDescription('The User to check.').setRequired(true);
  });

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({
      ephemeral: true,
    });
    const client = interaction.client;
    const guildMembers = interaction.guild.members;
    const specifiedUser = interaction.options.getUser('user');
    const specifiedGuildMember = await guildMembers.fetch(specifiedUser);
    if (specifiedGuildMember.isCommunicationDisabled()) {
      const timeoutTimestamp = specifiedGuildMember.communicationDisabledUntil;
      return await interaction.editReply({
        content: `${specifiedUser} is timed out until ${timeoutTimestamp}.`,
      });
    } else {
      return await interaction.editReply({
        content: `${specifiedUser} isn't currently timed out.`,
      });
    }
  } catch (err) {
    const errObject = new ErrorHandler(err, 'check_timeout');
    if (errObject.shouldExit) {
      return await interaction.editReply({
        content: errObject.message,
      });
    } else console.log(errObject.message);
  }
}
