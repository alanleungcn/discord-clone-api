require('dotenv').config();
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
	cors: {
		origin: process.env.CLIENT_URL || 'http://localhost:8080'
	}
});
const clients = [];

io.on('connection', (socket) => {
	socket.on('joinRoom', (data) => {
		clients.push({
			socketId: socket.id,
			name: data.name,
			voice: data.voice,
			mute: data.mute,
			deafen: data.deafen
		});
		const voiceClients = clients.filter((e) => e.voice);
		socket.emit('currentVoiceClients', voiceClients);
	});
	socket.on('sendMsg', (msg) => {
		socket.broadcast.emit('getMsg', msg);
	});
	socket.on('joinVoice', (data) => {
		const idx = clients.findIndex((e) => e.socketId === socket.id);
		if (idx < 0) return;
		clients[idx].voice = true;
		clients[idx].mute = data.mute;
		clients[idx].deafen = data.deafen;
		socket.broadcast.emit('addVoiceClient', clients[idx]);
	});
	socket.on('leaveVoice', () => {
		const idx = clients.findIndex((e) => e.socketId === socket.id);
		if (idx < 0) return;
		clients[idx].voice = false;
		socket.broadcast.emit('removeVoiceClient', { socketId: socket.id });
	});
	socket.on('updateMute', (data) => {
		const idx = clients.findIndex((e) => e.socketId === socket.id);
		if (idx < 0) return;
		clients[idx].mute = data.mute;
		socket.broadcast.emit('updateVoiceClient', {
			socketId: socket.id,
			mute: clients[idx].mute,
			deafen: clients[idx].deafen
		});
	});
	socket.on('updateDeafen', (data) => {
		const idx = clients.findIndex((e) => e.socketId === socket.id);
		if (idx < 0) return;
		clients[idx].deafen = data.deafen;
		socket.broadcast.emit('updateVoiceClient', {
			socketId: socket.id,
			mute: clients[idx].mute,
			deafen: clients[idx].deafen
		});
	});
	socket.on('signal', (data) => {
		socket.broadcast.emit('signalMade', { data: data, socketId: socket.id });
	});
	socket.on('leaveRoom', () => {
		removeClient(socket);
	});
	socket.on('disconnect', () => {
		removeClient(socket);
	});
});

function removeClient(socket) {
	const idx = clients.findIndex((e) => e.socketId === socket.id);
	if (idx < 0) return;
	if (clients[idx].voice)
		socket.broadcast.emit('removeVoiceClient', { socketId: socket.id });
	clients.splice(idx, 1);
}

setInterval(() => {
	console.log(clients);
}, 1000);

http.listen(process.env.PORT || 8081);
