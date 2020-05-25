const Keyv = require('keyv');
const Discord = require('discord.js')
const keyv = new Keyv('sqlite://data/favorites.sqlite');

module.exports.run = async function (client, message, args, ops) {
  keyv.on('error', err => console.error('Keyv connection error:', err));
  if (!await keyv.get(message.author.id)) await keyv.set(message.author.id, '');

  if (args[0]) {
    if (args[0].toUpperCase() === 'CLEAR') {
      keyv.set(message.author.id, '')
      return message.channel.send('🗑️ Successfully cleared your favorites list! 🗑️')
    }    
  }

	// bar
	let favorites = await keyv.get(message.author.id)
  if (favorites === '') return message.channel.send('Your favorites list is currently empty! Consider adding some songs.')
  
  let embed = new Discord.MessageEmbed()
    .setColor(0xffff00)
    .setTitle('Favorites List')
    .setDescription(favorites)
  
  message.channel.send(embed)
}

module.exports.help = {
  name: 'favorites'
}