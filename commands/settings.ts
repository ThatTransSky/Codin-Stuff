import { SlashCommandBuilder } from '@discordjs/builders';
import { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';
import { ChatInputCommandInteraction } from 'discord.js';
/*
Command Name: "settings-revamp"
Command Purpose: Reads the Config file for the current guild and updates a given setting with the specified value.
Command Options (if any): 
- setting_name, Required String Option
- updated_value, String Option
Required Permissions: MANAGE_GUILD (1 << 5)
Checks (if any): 
*/
export const data = new SlashCommandBuilder()
  .setName('settings') // Sets the name
  .setDescription(
    'Reads the Config file for the current guild and updates a given setting with the specified value.',
  ); // Sets the description
export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({
      ephemeral: true, // Always Ephemeral because it's a config command :)
    });
    const selectMenuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
      new StringSelectMenuBuilder()
        .setCustomId('settings_type')
        .setPlaceholder('Select the type of settings you want to change.')
        .addOptions([
          {
            label: 'Personal Settings',
            value: 'personal',
            description: 'Your (per-guild) Personal Settings.',
          },
          {
            label: 'Guild Settings',
            value: 'guild',
            description: "The Server's Settings. (Requires 'Manage Server' Permissions).",
          },
        ]),
    ]);
    const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('settings_exit')
        .setStyle(ButtonStyle.Danger)
        .setLabel('Exit'),
    );
    await interaction.editReply({
      content: 'Please select the type of settings you want to view / update.',
      components: [selectMenuRow, ButtonRow],
    });
    return console.log('/settings initalized.');
  } catch (err) {
    const errObject = new ErrorHandler(err, 'config');
    if (errObject.code !== 'Unhandled') {
      console.log(
        `End of code catch triggered:\nMessage: ${errObject.message}\nCode: ${errObject.code}`,
      );
    } else {
      console.log(err);
      console.log(`Unhandled end of code catch triggered:\n${errObject.message}`);
    }
  }
}
