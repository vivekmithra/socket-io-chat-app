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
    io.emit('chat message', { text: message.text, sender: userNames[socket.id] });
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    delete userNames[socket.id];
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
