const ErrorHandler = require('../handlers/ErrorHandler');

/*
Event Name: "interactionCreate"
Event Triggers: When a user interacts with the bot vis /commands, buttons, menus, etc.
Once: No
Event Arguments:
- Interaction: Information about the interaction that initiated this event.
- Client: The bot's client instance.
*/
module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isCommand()) {
      return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return; //Not used at the moment.
    try {
      await command.execute(interaction);
    } catch (err) {
      const errObject = new ErrorHandler(err.message, err.code, '');
      console.log(`Before interaction execution catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
    }
  },
};
