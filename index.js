const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

// Store usernames
const userNames = {};

// Handle incoming connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for username submission
  socket.on('set username', (username) => {
    userNames[socket.id] = username;
  });

  // Listen for chat messages
  socket.on('chat message', (message) => {
    if (message.text.startsWith('/')) {
      executeSlashCommand(socket, message.text);
    } else {
      io.emit('chat message', { text: message.text, sender: userNames[socket.id] });
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    delete userNames[socket.id];
    console.log('A user disconnected');
  });
});

function executeSlashCommand(socket, command) {
  const parts = command.split(' ');
  const action = parts[0].toLowerCase();
  switch (action) {
    case '/clear':
      clearChat(socket);
      break;
    case '/help':
      displayAvailableCommands(socket);
      break;
    case '/random':
      generateRandomNumber(socket, parts);
      break;
    // Add more slash commands and actions here
    default:
      // Handle unknown command
      break;
  }
}

function generateRandomNumber(socket, parts) {
  const min = parseInt(parts[1]) || 0;
  const max = parseInt(parts[2]) || 100;
  if (min > max) {
    io.to(socket.id).emit('chat message', { text: 'Invalid range', sender: 'System' });
  } else {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    socket.emit('chat message', { text: `Random number between ${min} and ${max}: ${randomNumber}`, sender: 'System' });
  }
}


function displayAvailableCommands(socket) {
  const availableCommands = [
    '/clear - Clear the chat',
    '/help - Display available commands',
    // Add more command descriptions here
  ];
  io.to(socket.id).emit('chat message', { text: availableCommands.join('\n'), sender: 'System' });
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
