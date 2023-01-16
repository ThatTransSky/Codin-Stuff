import {
  ChatInputCommandInteraction,
  italic,
  Message,
  time,
  SlashCommandBuilder,
} from 'discord.js';
/* 
Command Name: "uptime"
Command Purpose: Show the bot's current uptime.
Command Options (if any): None
Checks (if any): None
*/
export const data = new SlashCommandBuilder()
  .setName('uptime')
  .setDescription('Shows how long have the bot been online for.');
export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({
    ephemeral: false,
  });
  const client = interaction.client;
  const readyAt = client.readyAt.getTime();

  const rawTimestamp = Math.floor(readyAt / 1000);
  const uptimeTimestamp = time(rawTimestamp, 'R'); // Discord.JS's method to format timestamps messages

  return interaction.editReply({
    content: `I was ✨${italic('turned on')}✨ ${uptimeTimestamp}.`,
  });
}
