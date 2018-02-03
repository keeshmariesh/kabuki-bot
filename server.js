require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

const username = process.env.USERNAME;

client.login(process.env.TOKEN);
console.log('bot logged in');

const kabukiPath = `/home/${username}/code/kabuki-bot/src/music/kabuki.mp3`;
const kabukiShortPath = `/home/${username}/code/kabuki-bot/src/music/kabuki-short.mp3`;

function playKabuki(connection) {
  const dispatcher = connection.playFile(kabukiPath);
  dispatcher.on('end', e => {
    connection.disconnect();
  });
}

client.on('message', message => {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;
  if (message.content === '/join') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voiceChannel) {
      message.member.voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
          message.reply('YOOOOOOOOOOOOOOOOOOOOOOOO!');
          playKabuki(connection);
        })
        .catch(console.log);
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel;
  let oldUserChannel = oldMember.voiceChannel;
  
  if (oldUserChannel === undefined && newUserChannel !== undefined) {
    //user joined a channel
  } else if (newUserChannel === undefined) {
    //user left
  }
});