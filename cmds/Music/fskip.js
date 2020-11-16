
module.exports.run = async function(client, message, args, ops) {

  let skip = require("./dskip.js");

  let fetched = ops.active.get(message.guild.id);

  if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('You do not have permission to run this command.')

  if(!fetched) return message.channel.send('There currently isn\'t any music playing in the guild!');

  if(skip.skip === true) return message.channel.send('Skipping is currently disabled!')

  if (message.member.voice.channel !== message.guild.me.voice.channel) return message.channel.send('Sorry, you currently aren\'t in my voice channel!');

  let userCount = message.member.voice.channel.members.size;

  let required = 1;
  if (!fetched.queue[0].voteSkips) fetched.queue[0].voteSkips = [];


  fetched.queue[0].voteSkips.push(message.member.id);
  ops.active.set(message.guild.id, fetched);

  message.channel.send('✔️ Successfully skipped song!');
  message.react('👍')
  return fetched.dispatcher.emit('finish');
}

module.exports.help = {
  name: 'fskip',
  aliases: ['forceskip', 'foskip'],
  guildOnly: true
}
