const Discord = require('discord.js')
const Keyv = require('keyv');
//const keyv = new Keyv(process.env.DATABASE_URL);
const magicPages = []
const magTypes = ['fire', 'wind', 'ice', 'earth', 'water', 'psychic', 'demonic']
const { stripIndents } = require('common-tags')
const personalities = ['stoic', 'logical', 'joyful']
let pPersonality = ''
let pMagic = ''
let pName = ''

module.exports.run = async function (client, message, args, ops) {

  message.channel.send('Let\'s get started on character creation')
  await charName(client, message, args)
}

async function charName(client, message, args) {
  message.channel.send('What is your characters name?\n\n**Note:** No special characters or numbers allowed')
  let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {idle: 10000});
  collector.on('collect', message => {
    message.channel.send(`Are you sure you want your name to be **${message.content}?**\n\n**Note:** Once you select your name, you will not be able to change it later in your adventure`)
    pName = message.content.charAt(0).toUpperCase() + message.content.slice(1);;
    collector.stop('Operation Finished')
  });

  collector.on('end', (collected, reason) => {
    if (reason === 'Operation Finished') {
      const scollector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {idle: 10000});
      scollector.on('collect', message => {
        if (message.content.toLowerCase() === 'yes') {
          scollector.stop()
          magicType(client, message, args)
        } else if (message.content.toLowerCase() === 'no') {
          pName = ''
          scollector.stop()
          charName(client, message, args)
        }
      })
    }
  })
}

async function magicType(client, message, args) {
  let embed = new Discord.MessageEmbed()
    .setColor('RANDOM')
    .setTitle('Magics')
    .setDescription('Each Magician must wield a powerful magic. Please choose an available magic:')
    .addField('Magics', '`Fire`, `Wind`, `Ice`, `Earth`, `Water`, `Psychic`, `Demonic`')

  message.channel.send(embed)
  let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {idle: 10000});
  collector.on('collect', message => {
    if(!magTypes.includes(message.content.toLowerCase())) {
      message.channel.send('That is not a valid magic type.')
      collector.stop('Failed')
    } else {
      pMagic = message.content.charAt(0).toUpperCase() + message.content.slice(1);;
      message.channel.send(`Are you sure you wish to be a wielder of ${message.content} magic?`)
      collector.stop('Completed')
    }
  })

  collector.on('end', (collected, reason) => {
    if (reason === 'Failed') magicType(client, message, args)
    else if (reason === 'Completed') {
      let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {idle: 10000});
      collector.on('collect', message => {
        if (message.content.toLowerCase() === 'yes') {
          collector.stop()
          Personality(client, message, args)
        } else if (message.content.toLowerCase() === 'no') {
          pMagic = ''
          collector.stop()
          magicType(client, message, args)
        }
      })
    };
  })
}

async function Personality(client, message, args) {
  let embed = new Discord.MessageEmbed()
    .setColor('RANDOM')
    .setTitle('Personalities')
    .setDescription('No two magicians are going to act the same way. Please select an available personality:')
    .addField('Personalities:', stripIndents`
    **Stoic:** Pretty stone faced aren't ya?\n\n**Speed:** +2\n**Defense:** +2\n
    **Joyful:** Constant energy from this one. Do they know when to chill?\n\n**Speed:** +3\n
    **Logical:** Uses their brain. Quite the rare occurence nowadays.\n\n**Accuracy:** +2\n`)

  message.channel.send(embed)
  let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {idle: 10000});
  collector.on('collect', message => {
    if (!personalities.includes(message.content.toLowerCase())) {
      message.channel.send('That is not a valid personality type.')
      collector.stop()
      Personality(client, message, args)
    } else {
      pPersonality = message.content.charAt(0).toUpperCase() + message.content.slice(1);
      collector.stop()
      Finalize(client, message, args)
    }
  })
}

async function Finalize(client, message, args) {
  let embed = new Discord.MessageEmbed()
    .setColor('RANDOM')
    .setTitle('Character')
    .addField('Character sheet: ', stripIndents`
    **Name:** ${pName}
    **Magic:** ${pMagic}
    **Personality:** ${pPersonality}`)
    .setThumbnail(message.author.displayAvatarURL())

  message.channel.send(embed)
  message.channel.send('Is this correct?')
  let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {idle: 10000});
  collector.on('collect', message => {
    if (message.content.toLowerCase() === 'yes') {
      message.reply('Your character has been successfully created!')
      return collector.stop()
    } else if (message.content.toLowerCase() === 'no'){
      message.channel.send('Please restart creation.')
      collector.stop()
    }
  })
}

module.exports.help = {
  name: 'creation'
}
