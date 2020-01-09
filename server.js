const io = require('socket.io')();

let messageId = 1;
const messages = []; // Limit the size in future maybe
let connectedUsers = [];

io.on('connection', socket => {
  socket.color = Math.floor(Math.random() * 255); // eslint-disable-line no-param-reassign
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
  socket.on('add user', username => {
    const connectedUser = { id: socket.id, username, userColor: socket.color };
    connectedUsers.push(connectedUser);
    io.emit('update userlist', connectedUsers);
    console.log(connectedUsers);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
    const updatedUserList = connectedUsers.filter((id) => id.id !== socket.id);
    connectedUsers = updatedUserList;
    io.emit('update userlist', connectedUsers);
  });
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);
