const ErrorHandler = require('../handlers/ErrorHandler');

module.exports = {
  name: 'messageCreate',
  async execute(msg) {
    try {
      const msgChannel = msg.channel;
      const msgContent = msg.content;
      const author = msg.author;
      if (author.id !== process.env.CLIENT_ID) {
        console.log(
          `${author.username} (${author.id}) messaged "${msgContent}" in #${msgChannel.name}.`,
        );
      }
      return;
    } catch (err) {
      const errObject = new ErrorHandler(err, 'Event');
      console.log(`End of code catch triggered:
      Message: ${errObject.message}
      Code: ${errObject.code}`);
    }
  },
};
