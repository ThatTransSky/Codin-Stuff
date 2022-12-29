const { SlashCommandBuilder } = require('@discordjs/builders');
const ConfigFile = require('../handlers/ConfigHandler');
const ErrorHandler = require('../handlers/ErrorHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather') // Sets the name
    .setDescription('Get current Weather status about a specified location.') // Sets the description.
    .addStringOption((option) => {
      return option
        .setName('location_name')
        .setDescription(
          `The location's name. (Leave blank if you want to use the location in your settings).`,
        );
    }),
  async execute(interaction) {
    try {
      await interaction.deferReply({
        ephemeral: false,
      });
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      console.log(interaction.user.id);
      let locationName = interaction.options.getString('location_name', false);
      console.log(locationName);
      if (locationName === ('' || null || undefined)) {
        try {
          console.log(`Location Name is empty. Attempting to pull from the user's config`);
          config = new ConfigFile('personal', interaction.user);
          locationName = config.getSetting('weather_location', 'general');
        } catch (err) {
          console.log(err);
          locationName = null || undefined;
        }
        if (locationName === ('' || null || undefined)) {
          console.log('Location Name is still empty. Notifying user and exiting...');
          return await interaction.editReply({
            content: `Your saved location in your settings is invalid.
            Use /config personal weather update and enter a location using the following format:
            \`{City Name, State Name (US Only), Country Code}\`
            
            For a list of compatible country codes, visit https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes.`,
            ephemeral: true, // Always true because it an Error Reply.
          });
        }
      }
      const weatherData = '';
    } catch (err) {
      const errObject = new ErrorHandler(err, 'weather');
      console.log(`End of code catch triggered:
        Message: ${errObject.message}
        Code: ${errObject.code}`);
    }
  },
};
