import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
/*
Command Name: "ping"
Command Purpose: Checks that the bot is alive and well.
Command Options (if any): None
Checks (if any): None
Note: If you find THIS command confusing, sounds like a you problem 😎.
*/
export const data = new SlashCommandBuilder().setName('ping').setDescription('Pong!');

export async function execute(interaction: ChatInputCommandInteraction) {
  //console.log(interaction)
  interaction.reply({
    content: 'Pong!',
  });
}
