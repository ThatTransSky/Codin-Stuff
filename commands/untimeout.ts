import { SlashCommandBuilder } from '@discordjs/builders';
import { Config } from '../handlers/ConfigHandler.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';
import { ChatInputCommandInteraction } from 'discord.js';
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
export const data = new SlashCommandBuilder()
  .setName('untimeout')
  .setDescription("Remove a user's timeout.")
  .setDefaultMemberPermissions(1 << 40)
  .addUserOption((option) => {
    return option
      .setName('user')
      .setDescription("The User who's timeout you wish to remove.")
      .setRequired(true);
  });
export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const config = new Config(interaction.guild);
    const isEphemeral = config.getSetting('timeout', 'ephemeral');
    await interaction.deferReply({
      ephemeral: isEphemeral as boolean,
    });
    // Necessary constants
    const client = interaction.client;
    const guildMembers = interaction.guild.members;
    // Funnels the provided options into variables.
    const specifiedUser = interaction.options.getUser('user');
    await guildMembers
      .fetch(specifiedUser)
      .then((specifiedGuildMember) => specifiedGuildMember.timeout(null));
    console.log(`Successfully removed ${specifiedUser.tag}'s timeout!`);
    return interaction.editReply({
      content: `Successfully removed ${specifiedUser}'s timeout!`,
    });
  } catch (err) {
    const errObject = new ErrorHandler(err, 'untimeout');
    if (errObject.shouldExit) {
      return await interaction.editReply({
        content: errObject.message,
      });
    } else console.log(errObject.message);
  }
}
