
module.exports.run = async function(client, message, args, ops) {

    if (!message.member.voice.channel) return message.channel.send("You are not currently connected to a voice channel!");
    if (message.guild.me.voice.channel) {
      if (message.member.voice.channel !== message.guild.me.voice.channel) return message.channel.send('Sorry, you currently aren\'t in my voice channel!');
    }

    message.guild.me.voice.channel.leave();

    message.channel.send('I\'ve been disconnected')
}

module.exports.help = {
    name: 'kys',
    aliases: ['die', 'dis', 'disconnect', 'leave']
}