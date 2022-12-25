const { SlashCommandBuilder } = require('@discordjs/builders');
const ErrorHandler = require('../handlers/ErrorHandler');
const request = require('request');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather') // Sets the name
    .setDescription('') // Sets the description
    .setDefaultMemberPermissions(), // Sets the required permissions ()
  async execute(interaction) {
    try {
      await interaction.deferReply({});
      // Necessary constants
      const { client } = interaction;
      const guildMembers = await interaction.guild.members;
      const websiteForCountryCodes = 'https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes';
      const apiToken = process.env.WEATHER_TOKEN;
      const baseUrl = 'http://api.openweathermap.org/data/2.5/weather?';
      const fullUrl = `${baseUrl}lat=${lat}&lon=${lon}&appid=${apiToken}`;
      const requestResult = request(fullUrl, { json: true }, (err, res, body) => {
        if (err) {
          // If there was an error, return an error message
          return 'Error: Could not retrieve weather data for the specified location.';
        } else {
          // If the request was successful, return the weather data
          return body;
        }
      });
    } catch (err) {
      const errObject = new ErrorHandler(err, 'weather');
      console.log(`End of code catch triggered:
        Message: ${errObject.message}
        Code: ${errObject.code}`);
    }
  },
};
