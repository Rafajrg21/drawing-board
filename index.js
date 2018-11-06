
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = app.listen(port);
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

server.listen(port, () => console.log('listening on port ' + port));

io.sockets.on('connection', function(socket){
    io.emit('hello');
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    socket.on('disconnected',function(user){
		socket.broadcast.emit('disconnected',user);
	});
});

