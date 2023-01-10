// // Not used & is still a WIP.

// const { fs } = require('fs');

// const getFiles = (path, ending) => {
//   return fs.readdirSync(path).filter((f) => f.endsWith(ending));
// };

// module.exports = (bot, reload) => {
//   const { client } = bot;

//   let slashCommands = getFiles('./commands/', '.js');

//   if (slashCommands.length === 0) console.log('No Commands Loaded.');

//   slashCommands.forEach((f) => {
//     if (reload) delete require.cache[require.resolve(`../commands/${f}`)];
//     const slashCommand = require(`../commands/${f}`);

//     client.slashcommands.set(slashCommand.name, slashCommand);
//   });
// };
