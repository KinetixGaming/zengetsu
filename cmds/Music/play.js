const ytdlp = require("ytdl-core-discord");
const ytdl = require("ytdl-core");
const prism = require("prism-media");
const fs = require("fs");
const Discord = require('discord.js')
const YouTube = require("simple-youtube-api");
const fetch = require('node-fetch');
let loop = require("./loop.js");

const { getData, getPreview } = require("spotify-url-info");
const youtube = new YouTube("AIzaSyCwGh6sW0oPGsMwvWroAPssXPwm33L_zRw");

module.exports.run = async (client, message, args, ops) => {
  if (!message.member.voice.channel) return message.channel.send("You are not currently connected to a voice channel!");
  if (message.guild.me.voice.channel) {
    if (message.member.voice.channel !== message.guild.me.voice.channel) return message.channel.send('Sorry, you currently aren\'t in my voice channel!');
  }
  
  let voiceChannel = message.member.voice.channel;

  if (!args[0])
    return message.channel.send(
      "Sorry, please input a url following the play command!"
    );

  let validate = await ytdl.validateURL(args[0]);
  // /^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/
  if (!validate && args[0].match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/)) {
    try {
      const playlist = await youtube.getPlaylist(args[0]);
      const videos = await playlist.getVideos();
      console.log(videos)
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id);
        await handleVideo(video2, message, voiceChannel, true);
      }
  } catch (err) {
    console.log(err.stack)
    return message.channel.send('An error has occured: ' + err.message)
  }
    return message.channel.send(` Playlist: **${playlist.title}** has been added to the queue.`);
  } else if (!validate && args[0].includes("https://open.spotify.com/track/")) {
      try {

        let spotData = await getPreview(args[0])
        const YTurl = await youtube.searchVideos((spotData.title + spotData.artist), 1)
        const video3 = await youtube.getVideoByID(YTurl[0].id)
        await handleVideo(video3, message, voiceChannel, false)
    } catch (err) {
      console.log(err)
      message.channel.send('Seemed I messed up somewhere. I hate my life!')
      let embed = new Discord.MessageEmbed()
        .setDescription(err.message)
        .setFooter('Please contact the bot author if problems continue')

      message.channel.send(embed)
    }

  }  else if (!validate && message.content.includes('https://soundcloud.com/')) {
      return message.channel.send('Soundcloud audio is not yet supported, but I\'m working on it!')

  } else if (!validate && args[0].match(/^(?:https:\/\/open\.spotify\.com|spotify)([\/:])user\1([^\/]+)\1playlist\1([a-z0-9]+)/) || args[0].includes('https://open.spotify.com/album/')) {
    let playData = await getData(args[0])
    for (const video of Object.values(playData.tracks.items)) {
      try {

        if(args[0].match(/^(?:https:\/\/open\.spotify\.com|spotify)([\/:])user\1([^\/]+)\1playlist\1([a-z0-9]+)/)) {
          const vidData = await getPreview(video.track.external_urls.spotify)
        }

        const vidData = await getPreview(video.external_urls.spotify)
        const URL = await youtube.searchVideos((vidData.title + vidData.artist), 1)

        if(URL.length <= 0) message.channel.send(`Not search results came up for: **${vidData.title} - ${vidData.artist}**`)

        const video4 = await youtube.getVideoByID(URL[0].id)
        await handleVideo(video4, message, voiceChannel, true)
      } catch (err) {
        console.log('Fetched an error: ' +err.message)
      }
    }

    return message.channel.send('**Spotify Playlist/Album has been added to the queue**')

  } else if (!validate) {
     let commandFile = require(`./search.js`);
     return commandFile.run(client, message, args, ops);
  }

  if (validate) {

    let video = await youtube.getVideo(args[0]);
    return handleVideo(video, message, voiceChannel);

  }

  async function handleVideo(video, msg, voiceChannel, playlist = false) {
    let fetch_Loop = ops.active.get(message.guild.id);
    let info = {
      id: video.id,
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      durationSec: video.duration.seconds,
      durationMin: video.duration.minutes
    };
    let data = ops.active.get(message.guild.id) || {};
    const queue = data.queue;
    if (!data.connection) data.connection = await message.member.voice.channel.join(); //If there isn't a connection create one
    if (!data.queue) data.queue = [];
    data.guildID = message.guild.id;

    data.queue.push({
      songTitle: info.title,
      requester: message.author.tag,
      url: info.url,
      announcementChannel: message.channel.id,
      thumbnail: info.id,
      durationSec: info.durationSec,
      durationMin: info.durationMin
    });

    if (!data.dispatcher) {
      play(client, ops, data);
    } else {
      if (playlist) return undefined;
      else message.channel.send(`Loading...`).then((sentMessage) => sentMessage.edit(`Added To Queue: **${info.title}** | Request By: ${data.queue[data.queue.length - 1].requester} `, {allowedMentions: {parse: []}})).then(msg => {msg.delete({timeout: 10000});});
    }

    ops.active.set(message.guild.id, data);
  }
};

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

async function play(client, ops, data) {
  var channel = client.channels.cache.get(data.queue[0].announcementChannel);
  channel
    .send(
      `🎵 Now Playing: **${data.queue[0].songTitle}** 🎵 | Requested by: @${data.queue[0].requester}`, {allowedMentions: {parse: []}}
    )
    .then(msg => {
      msg.delete({timeout: 10000});
    });
  //const input = await ytdl(data.queue[0].url)
  //data.queue[0].url = 'https://www.youtube.com' + data.queue[0].url
  //const pcm = input.pipe(new prism.opus.Decoder({rate: 48000, channels: 2, frameSize: 960}));
  //let songing = ytdl(data.queue[0].url).pipe(fs.createWriteStream('playing' + data.guildID + '.flv', {flags: 'w'}));

  //await new Promise(done => setTimeout(done, 3000));
  //let readStream = fs.createReadStream('playing' + data.guildID + '.flv');

  //data.dispatcher = await data.connection.playStream(readStream, {quality: 'highestaudio', highwatermark: 1>>25, type: 'opus'});
  data.dispatcher = data.connection.play(
    ytdl(data.queue[0].url, { quality: "highestaudio", highwatermark: '512', type: 'opus', filter: 'audioonly' })
  );
  //data.dispatcher = await data.connection.playConvertedStream(await pcm, {filter: 'audioonly', quality: 'highestaudio', highwatermark: 1>>25});
  data.dispatcher.guildID = data.guildID;
  data.dispatcher.once("finish", function() {
    finish(client, ops, data, channel);
  });
}

function finish(client, ops, dispatcher, channel) {
  let loop = require("./loop.js");
  let fetched = ops.active.get(dispatcher.guildID);
  if (loop.loop === true) {
    console.log("Looping is currently Enabled.");
    fetched.queue.push(fetched.queue.shift());
  } else {
    fetched.queue.shift();
  }

  if (fetched.queue.length > 0) {

    let vc = client.guilds.resolve(dispatcher.guildID).me.voice.channel;

    if(vc.members.size <= 1) {
      channel.send('No one left in Voice Channel.')
      ops.active.delete(dispatcher.guildID);
      return vc.leave();
    }

    ops.active.set(dispatcher.guildID, fetched);

    play(client, ops, fetched);
  } else {
    ops.active.delete(dispatcher.guildID);

    let vc = client.guilds.resolve(dispatcher.guildID).me.voice.channel;
    if (vc) {
      channel.send('No more music to play.')
      vc.leave();
    }
  }
}

module.exports.help = {
  name: "play",
  aliases: ["p", "music"],
  guildOnly: true
};
