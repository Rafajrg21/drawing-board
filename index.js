/* Express and Socket.io Drawing board 
 *  Web 2
 *  Authors: Rafael Romero & Ana Fabiola Quintero
 * 
 */
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = app.listen(port);
const io = require('socket.io')(server);

// Static files
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

// Start the server
server.listen(port, () => console.log('listening on port ' + port));

// Initial connection event of Socket.io
io.sockets.on('connection', function (socket) {
  io.emit('connect');
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
  socket.on('disconnected', function (user) {
    socket.broadcast.emit('disconnected', user);
  });
});