const io = require('socket.io')();

let messageId = 1;
const messages = []; // Limit the size in future maybe

io.on('connection', socket => {
  socket.color = Math.floor(Math.random() * 255);
  console.log('a user connected');
  io.to(`${socket.id}`).emit('message history', messages);
  socket.on('message', message => {
    const messageObject = {
      id: messageId,
      user: message.username,
      value: message.value,
      sentAt: new Date().toLocaleTimeString(),
      userColor: socket.color
    };
    messages.push(messageObject);
    console.log(messageObject);
    io.emit('message', messageObject);
    messageId += 1;
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);
