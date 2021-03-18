const Discord = require("discord.js")
const Crawler = require("crawler")


module.exports.run = async function (client, message, args, ops) {
    let urls = [];

    const c = new Crawler({
        callback: function(error, res, done) {
            if (error) {
                console.log({error})
            } else {
                const images = res.$('.crslimg')
                for(i = 0; i < images.length; i++) {
                    urls.push(images[i].attribs.style.match(/(https?:\/\/[^ ]*)/))
                    
                }

                var item = urls[Math.floor(Math.random() * urls.length)];
                item = Array.from(new Set(item[0].split(' '))).toString();
                item = item.replace(/\'/gi,'');
                item = item.replace(/\)/gi,'');
                console.log(item);
                let embed = new Discord.MessageEmbed()
                .setColor('RANDOM')
                .setImage(item)
                .setDescription('Please give me my time back - Kinetix')
            
                message.channel.send(embed);
                
            }
        }
    })

    await c.queue('https://www.wikifeet.com/celebs')

}
    
module.exports.help = {
    name: 'feet',
    aliases: ['ft']
}