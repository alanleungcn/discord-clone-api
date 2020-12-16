const clients = new Map();

function addClient(socketId, name) {
	clients.set(socketId, { name: name, mute: false, deafen: false });
	console.log(clients);
}

function joinVoice(socketId, mute, deafen) {
	const client = clients.get(socketId);
	if (!client) return;
	client.mute = mute;
	client.deafen = deafen;
	return client.name;
}

module.exports = {
	addClient,
	joinVoice
};
