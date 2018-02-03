require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

const username = process.env.USERNAME;

client.login(process.env.TOKEN);
console.log('bot logged in');

const dontPlayFor = [];
const userIntervals = {};

function recordUserActivity(username) {
  console.log(username + ' has done something!');
  if (dontPlayFor.indexOf(username) === -1) {
    dontPlayFor.push(username);
    console.log('wont play for ' + username + ' after this.');
  }
  if (userIntervals[username]) {
    clearInterval(userIntervals[username]);
    delete userIntervals[username];
    console.log('reseting activity timer for ' + username);
  }
  const interval = setInterval(() => {
    const index = dontPlayFor.indexOf(username);
    if (index === -1) return;
    dontPlayFor.splice(index, 1);
    console.log(username + ' has been gone long enough. will spam them!');
  }, 30 * 1000);
  userIntervals[username] = interval;
}

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
  let username;
  if (oldMember) {
    username = oldMember.user.username;
  } else if (newMember) {
    username = newMember.user.username;
  }

  if(username === 'kabukibot') return;

  console.log(dontPlayFor);
  if (newUserChannel !== undefined && newUserChannel.position === 0) {
    if (dontPlayFor.indexOf(username) === -1) {
      newUserChannel.join().then(connection => {
        if (dontPlayFor.length === 0) {
          console.log("no one's been here for a while. play long kabuki");
          playKabuki(connection);
        } else {
          console.log('this place is busy! playing short kabuki');
          playKabukiShort(connection);
        }
        recordUserActivity(username);
      });
    }
  } else if (newUserChannel === undefined) {
    recordUserActivity(username);
  }
});