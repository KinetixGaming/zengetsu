
module.exports.run = async function(client, message, args, ops) {

    if (!message.member.voice.channel) return message.channel.send("You are not currently connected to a voice channel!");
    if (message.guild.me.voice.channel) {
      if (message.member.voice.channel !== message.guild.me.voice.channel) return message.channel.send('Sorry, you currently aren\'t in my voice channel!');
    }

    let vc = client.guilds.resolve(dispatcher.guildID).me.voice.channel;

    channel.send('No one left in Voice Channel.')
    ops.active.delete(dispatcher.guildID);
    return vc.leave();
}

module.exports.help = {
    name: 'kys',
    aliases: ['die', 'dis', 'disconnect', 'leave']
}