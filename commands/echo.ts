import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
/* 
Command Name: "echo"
Command Purpose: Receive a message and relay it back to the user.
Command Options (if any):
- Message (String Option, Required)
Checks (if any): None (Might add one in the future to sterialize the string, if that's a threat.)
*/
export const data = new SlashCommandBuilder()
  .setName('echo')
  .setDescription('Echos your input')
  .addStringOption((option) => {
    return option.setName('message').setDescription('The message to echo').setRequired(true);
  });

export async function execute(interaction: ChatInputCommandInteraction) {
  interaction.reply({
    content: interaction.options.getString('message'),
    ephemeral: true,
  });
}
