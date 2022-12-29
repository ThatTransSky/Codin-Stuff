const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const ErrorHandler = require('../handlers/ErrorHandler');

module.exports = {
  data: new SlashCommandBuilder().setName('reload').setDescription("Reloads the Bot's instance."),
  async execute(interaction) {
    try {
      await interaction.deferReply({
        ephemeral: true,
      });
      const { client } = interaction;
      const client_id = client.user.id;
      const guilds = await client.guilds.fetch();
      const commandFiles = fs
        .readdirSync(path.join(__dirname))
        .filter((file) => file.endsWith('.js'));
      const commands = [];
      const rest = new REST({
        version: '9',
      }).setToken(process.env.TOKEN);

      // (async () => {
      //   try {
      //     if (process.env.ENV === 'Production') {
      //       await rest.put(Routes.applicationCommands(client_id), {
      //         body: [],
      //       });
      //       console.log('Seccessfully cleared commands globaly.');
      //     } else {
      //       // Registers the commands locally (per-guild).
      //         await rest.put(Routes.applicationGuildCommands(client_id, process.env.GUILD_ID), {
      //           body: [],
      //         });
      //         console.log(`Seccessfully cleared commands in '${.name}'.`);
      //     }
      //   } catch (err) {
      //     if (err) console.error(err);
      //   }
      // })();

      client.commands.clear();

      for (const file of commandFiles) {
        const command = require(`${path.join(__dirname)}/${file}`);
        commands.push(command.data.toJSON());
        console.log(`Command '${command.data.toJSON().name}' Added to Array.`);
        client.commands.set(command.data.name, command);
      }
      if (commands === []) {
        throw new Error('Invalid Form Body');
      }
      const guild = await client.guilds.fetch(process.env.GUILD_ID)(async () => {
        try {
          if (process.env.ENV === 'Production') {
            await rest.put(Routes.applicationCommands(client_id), {
              body: commands,
            });
            console.log('Seccessfully registered commands globaly.');
          } else {
            // Registers the commands locally (per-guild).
            await rest.put(Routes.applicationGuildCommands(client_id, guild.id), {
              body: commands,
            });
            console.log(`Seccessfully registered commands in '${guild.name}'.`);
          }
        } catch (err) {
          if (err) console.error(err);
        }
      })();
      const eventFiles = fs
        .readdirSync(path.join(__dirname, '..', 'events'))
        .filter((file) => file.endsWith('.js'));
      for (const file of eventFiles) {
        const event = require(`${path.join(__dirname, '..', 'events')}/${file}`);
        console.log(event);
        client.off(event.name, (...args) => event.execute(...args));
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, commands)); // Runs the "run-once" events.
        } else {
          client.on(event.name, (...args) => event.execute(...args, client)); // Runs the rest of the events.
        }
      }

      return await interaction.editReply({
        content: 'Success?',
      });
    } catch (err) {
      const errorObject = new ErrorHandler(err, 'reload');
      await interaction.editReply({
        content: errorObject.message,
      });
      console.log(`Raw Error Stack: ${errorObject.stack}`);
    }
  },
};
