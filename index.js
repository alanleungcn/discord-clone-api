require('dotenv').config();
const app = require('express')();
const http = require('http').createServer(app);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
const io = require('socket.io')(http, {
	cors: {
		origin: clientUrl
	}
});
const { addClient, joinVoice } = require('./socket.js');

io.on('connection', (socket) => {
	socket.on('joinRoom', ({ name }) => {
		addClient(socket.id, name);
	});
	socket.on('emitMsg', (msg) => {
		socket.broadcast.emit('addMsg', msg);
	});
	socket.on('signal', (data) => {
		io.to(data.id).emit();
	});
	socket.on('joinVoice', ({ mute, deafen }) => {
		const name = joinVoice(socket.id, mute, deafen);
		socket.broadcast.emit('addVoiceClient', {
			socketId: socket.id,
			name: name
		});
	});
	socket.on('signal', (data) => {
		socket.broadcast.emit('signalMade', { data: data, socketId: socket.id });
	});
	socket.on('leaveVoice', () => {
		socket.broadcast.emit('removeVoiceClient', { socketId: socket.id });
	});
});

http.listen(process.env.PORT || 8081);
