require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

const username = process.env.USERNAME;

client.login(process.env.TOKEN);
console.log('bot logged in');

let dispatcher;

const kabukiPath = `/home/${username}/code/kabuki-bot/src/music/kabuki.mp3`;
const kabukiShortPath = `/home/${username}/code/kabuki-bot/src/music/kabuki-short.mp3`;

function playSound(connection, soundPath) {
  if (dispatcher) {
    return;
  }
  dispatcher = connection.playFile(soundPath);
  dispatcher.on('end', e => {
    connection.disconnect();
    dispatcher = null;
  });
}

function playKabuki(connection) {
  playSound(connection, kabukiPath);
}

function playKabukiShort(connection) {
  playSound(connection, kabukiShortPath);
}

client.on('message', message => {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;
  if (message.content === '/yo') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voiceChannel) {
      message.member.voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
          if (dispatcher) {
            return message.reply("I'm busy yo'ing!");  
          }
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
  const newUserChannel = newMember.voiceChannel;
  if(newMember.user.username === 'kabukibot') return;
  
  if (newUserChannel !== undefined && newUserChannel.position === 0) {
    newUserChannel.join().then(connection => {
      playKabukiShort(connection);
    });
  } else if (newUserChannel === undefined) {
    //user left
  }
});