import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  ButtonBuilder,
  TextInputBuilder,
  TextInputStyle,
  Interaction,
  InteractionType,
  StringSelectMenuInteraction,
  ButtonStyle,
  inlineCode,
  italic,
  bold,
} from 'discord.js';
import { Config } from '../handlers/ConfigHandler.js';
import { ErrorHandler } from '../handlers/ErrorHandler.js';
import { Client2 } from '../main';

/*
Event Name: "interactionCreate"
Event Triggers: When a user interacts with the bot vis /commands, buttons, menus, etc.
Once: No
Event Arguments:
- Interaction: Information about the interaction that initiated this event.
- Client: The bot's client instance.
*/
export const name = 'interactionCreate';
export async function execute(interaction: Interaction, client: Client2) {
  try {
    if (interaction.type === InteractionType.ApplicationCommand) {
      // Handle Slash Commands Here
      const command = client.commands.get(interaction.commandName);
      if (!command || !interaction.isChatInputCommand()) return; //Not used at the moment.
      await command.execute(interaction);
    } else if (interaction.type === InteractionType.ModalSubmit) {
      // Handle Modal Interactions Here
      if (!interaction.isFromMessage()) return;
      // console.log(interaction);
      if (interaction.customId.includes('_update_')) {
        const type = interaction.customId.split('_')[0];
        const settingName = interaction.customId.split('_')[2];
        const updatedValue = interaction.fields
          .getTextInputValue(`${type}_update_${settingName}`)
          .toLowerCase();
        console.log(updatedValue);
        try {
          if (type === 'personal') {
            const config = new Config(interaction.user);
            await config.updateSetting(settingName, updatedValue);
          } else if (type === 'guild') {
            const config = new Config(interaction.guild);
            await config.updateSetting(settingName, updatedValue);
          }
          let message: string;
          const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
              .setCustomId(`back_to_${type}`)
              .setStyle(ButtonStyle.Secondary)
              .setLabel('Back'),
            new ButtonBuilder()
              .setCustomId('back_to_start')
              .setStyle(ButtonStyle.Secondary)
              .setLabel('Back to Start'),
            new ButtonBuilder()
              .setCustomId('settings_exit')
              .setStyle(ButtonStyle.Danger)
              .setLabel('Exit'),
          ]);
          message = `${inlineCode(settingName)} successfully updated to ${inlineCode(
            updatedValue,
          )}.`;
          await interaction.update({
            content: message,
            components: [ButtonRow],
          });
        } catch (err) {
          console.error(err);
          const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
              .setCustomId(`${type}_update_${settingName}`)
              .setStyle(ButtonStyle.Primary)
              .setLabel('Update'),
            new ButtonBuilder()
              .setCustomId(`back_to_${type}`)
              .setStyle(ButtonStyle.Secondary)
              .setLabel('Back'),
            new ButtonBuilder()
              .setCustomId('back_to_start')
              .setStyle(ButtonStyle.Secondary)
              .setLabel('Back to Start'),
            new ButtonBuilder()
              .setCustomId('settings_exit')
              .setStyle(ButtonStyle.Danger)
              .setLabel('Exit'),
          ]);
          if (err.code === 'InvalidValueType') {
            let message: string = `${italic(bold('(Updated value failed a check)'))}\n\n`;
            let settingValue;
            if (type === 'personal') {
              const config = new Config(interaction.user);
              settingValue = config.getSetting(settingName);
              message += `${inlineCode(settingName)} is currently set to ${inlineCode(
                settingValue,
              )}`;
            } else if (type === 'guild') {
              const config = new Config(interaction.guild);
              settingValue = config.getSetting(settingName);
              message += `${inlineCode(settingName)} is currently set to ${inlineCode(
                settingValue,
              )}`;
              if (config.getSettingCategory(settingName) === 'info') {
                ButtonRow.components[0].setDisabled(true);
                message += `\n\n${italic(
                  '(This is a read-only value intended to keep some basic info about the server for future reference)',
                )}`;
              }
            }
            await interaction.update({
              content: message,
              components: [ButtonRow],
            });
          } else if (err.code === 'NoChangesMade') {
            let message: string = `${italic(
              bold('(Updated value is the same as current value)'),
            )}\n\n`;
            let settingValue;
            if (type === 'personal') {
              const config = new Config(interaction.user);
              settingValue = config.getSetting(settingName);
              message += `${inlineCode(settingName)} is currently set to ${inlineCode(
                settingValue,
              )}`;
            } else if (type === 'guild') {
              const config = new Config(interaction.guild);
              settingValue = config.getSetting(settingName);
              message += `${inlineCode(settingName)} is currently set to ${inlineCode(
                settingValue,
              )}`;
              if (config.getSettingCategory(settingName) === 'info') {
                ButtonRow.components[0].setDisabled(true);
                message += `\n\n${italic(
                  '(This is a read-only value intended to keep some basic info about the server for future reference)',
                )}`;
              }
            }
            await interaction.update({
              content: message,
              components: [ButtonRow],
            });
          } else {
            console.log(err);
          }
        }
      }
    } else if (interaction.isButton()) {
      // Handle Button Interactions Here
      // console.log(interaction);

      if (interaction.customId === 'settings_exit') {
        // Exit the settings view
        interaction.update({
          content: `Settings View Ended.`,
          components: [],
        });
      } else if (interaction.customId.includes('back_to_')) {
        const where = interaction.customId.split('_').at(-1);
        if (where === 'personal') {
          // Going back to personal settings
          const config = new Config(interaction.user);
          const SettingSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('personal_settings')
              .setPlaceholder('Select the setting you want to view.')
              .addOptions(config.settingsToArrayofOptions()),
          );
          const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('back_to_start')
              .setStyle(ButtonStyle.Secondary)
              .setLabel('Back'),
            new ButtonBuilder()
              .setCustomId('settings_exit')
              .setStyle(ButtonStyle.Danger)
              .setLabel('Exit'),
          );
          await interaction.update({
            content: 'Here are your settings.\nSelect which one you want to view.',
            components: [SettingSelectMenu, ButtonRow],
          });
        } else if (where === 'guild') {
          // Going back to guild settings / info
          const config = new Config(interaction.guild);
          const SettingSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('guild_settings')
              .setPlaceholder('Select the setting you want to view.')
              .addOptions(config.settingsToArrayofOptions()),
          );
          const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('back_to_start')
              .setStyle(ButtonStyle.Secondary)
              .setLabel('Back'),
            new ButtonBuilder()
              .setCustomId('settings_exit')
              .setStyle(ButtonStyle.Danger)
              .setLabel('Exit'),
          );
          await interaction.update({
            content: `Here are the server's settings.\nSelect which one you want to view.`,
            components: [SettingSelectMenu, ButtonRow],
          });
        } else if (where === 'start') {
          // Going back to the start (as if you just used /settings)
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
          await interaction.update({
            content: 'Please select the type of settings you want to view.',
            components: [selectMenuRow, ButtonRow],
          });
        }
      } else if (interaction.customId.includes('_update_')) {
        const type = interaction.customId.split('_')[0];
        const settingName = interaction.customId.split('_')[2];
        const updateValueForm = new ModalBuilder()
          .setCustomId(`${type}_update_${settingName}`)
          .setTitle(`Update Value of ${settingName}`)
          .addComponents([
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId(`${type}_update_${settingName}`)
                .setStyle(TextInputStyle.Short)
                .setLabel('Updated Value')
                .setRequired(true),
            ),
          ]);
        await interaction.showModal(updateValueForm);
      }
    } else if (interaction.type === InteractionType.MessageComponent) {
      // Handle Select Menu Interactions Here
      if (interaction instanceof StringSelectMenuInteraction) {
        if (interaction.customId === 'settings_type') {
          // First Stage Settings
          const interactionValue = interaction.values[0];

          if (interactionValue === 'personal') {
            const config = new Config(interaction.user);
            const SettingSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              // Creates a list of options by the user's config
              new StringSelectMenuBuilder()
                .setCustomId('personal_settings')
                .setPlaceholder('Select the setting you want to view.')
                .addOptions(config.settingsToArrayofOptions()),
            );
            const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
              // Creates the 'back' and 'exit buttons
              new ButtonBuilder()
                .setCustomId('settings_exit')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Exit'),
            );
            await interaction.update({
              // Shows a list of personal settings
              content: `Here are your settings.\nSelect which one you want to view.`,
              components: [SettingSelectMenu, ButtonRow],
            });
          } else if (interactionValue === 'guild') {
            const config = new Config(interaction.guild);
            const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
              // Creates the 'back' and 'exit' buttons
              new ButtonBuilder()
                .setCustomId('back_to_start')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Back'),
              new ButtonBuilder()
                .setCustomId('settings_exit')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Exit'),
            );
            if (interaction.memberPermissions.has('ManageGuild')) {
              const SettingSelectMenu =
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                  // Creates a list of options by the guild's config
                  new StringSelectMenuBuilder()
                    .setCustomId('guild_settings')
                    .setPlaceholder('Select the setting you want to view.')
                    .addOptions(config.settingsToArrayofOptions()), // Should remove `administrators` as it's the last option.
                );
              await interaction.update({
                // Shows a list with the guild's settings
                content: `Here are the Server's settings.\nSelect which one you want to view.`,
                components: [SettingSelectMenu, ButtonRow],
              });
            } else {
              await interaction.update({
                // Shows a message, letting the user know they lack permissions
                content: `You do not have enough permissions to view the server's settings.`,
                components: [ButtonRow],
              });
            }
          }
        } else if (interaction.customId === 'personal_settings') {
          const settingName = interaction.values[0];
          const config = new Config(interaction.user);
          try {
            const settingValue = config.getSetting(settingName);
            const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
              // Creates the 'update', 'back', 'back to start' and 'exit' buttons.
              new ButtonBuilder()
                .setCustomId(`personal_update_${settingName}`)
                .setStyle(ButtonStyle.Primary)
                .setLabel('Update'),
              new ButtonBuilder()
                .setCustomId('back_to_personal')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Back'),
              new ButtonBuilder()
                .setCustomId('back_to_start')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Back to Start'),
              new ButtonBuilder()
                .setCustomId('settings_exit')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Exit'),
            ]);
            let message = `${inlineCode(settingName)} is currently set to ${inlineCode(
              String(settingValue),
            )}`;
            await interaction.update({
              content: message,
              components: [ButtonRow],
            });
          } catch (err) {
            console.error(err);
          }
        } else if (interaction.customId === 'guild_settings') {
          const settingName = interaction.values[0];
          const config = new Config(interaction.guild);
          try {
            const settingValue = config.getSetting(settingName);
            const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
              new ButtonBuilder()
                .setCustomId(`guild_update_${settingName}`)
                .setStyle(ButtonStyle.Primary)
                .setLabel('Update'),
              new ButtonBuilder()
                .setCustomId('back_to_guild')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Back'),
              new ButtonBuilder()
                .setCustomId('back_to_start')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Back to Start'),
              new ButtonBuilder()
                .setCustomId('settings_exit')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Exit'),
            ]);
            let message = `${inlineCode(settingName)} is currently set to ${inlineCode(
              String(settingValue),
            )}`;
            if (config.getSettingCategory(settingName) === 'info') {
              ButtonRow.components[0].setDisabled(true);
              message += `\n\n${italic(
                '(This is a read-only value intended to keep some basic info about the server for future reference)',
              )}`;
            }
            await interaction.update({
              content: message,
              components: [ButtonRow],
            });
          } catch (err) {
            console.error(err);
          }
        }
      } // Add here to handle other types of select menu's
    }
  } catch (err) {
    const errObject = new ErrorHandler(err, 'interaction');
    if (errObject.code !== 'Unhandled') {
      console.log(
        `End of code catch triggered:\nMessage: ${errObject.message}\nCode: ${errObject.code}`,
      );
    } else {
      console.log(err);
      console.log(
        `Unhandled end of code catch triggered with action ${errObject.action}:\n${errObject.message}`,
      );
    }
  }
}
