const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const ErrorHandler = require('../handlers/ErrorHandler');
/*
Command Name: "random-color"
Command Purpose: Replys with a random color (in hex format).
Command Options (if any): 
Required Permissions: none
Checks (if any): None
*/
module.exports = {
  data: new SlashCommandBuilder()
    .setName('random-color') // Sets the name
    .setDescription('Gives you a random color.'), // Sets the description
  async execute(interaction) {
    try {
      await interaction.deferReply({
        ephemeral: true,
      });
      // Necessary constants
      const { client } = interaction;
      const rgbColor = [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
      ];
      const embed = new EmbedBuilder().setColor([rgbColor[0], rgbColor[1], rgbColor[2]]).addFields({
        name: 'Title',
        value: `Here's a random color: [${rgbColor}](https://www.thecolorapi.com/id?format=html&rgb=${rgbColor[0]},${rgbColor[1]},${rgbColor[2]})`,
      });
      return await interaction.editReply({
        embeds: [embed.data],
      });
    } catch (err) {
      const errObject = new ErrorHandler(err, 'random-color');
      if (errObject.shouldExit) {
        return await interaction.editReply({
          content: errObject.message,
          ephemeral: true,
        });
      } else console.log(errObject.message);
    }
  },
};
