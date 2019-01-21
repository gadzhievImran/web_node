const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', ws => {
    ws.on('message', message => {
        if(message === 'exit') {
            return void ws.close();
        }

        server.clients.forEach(client => {
            if(client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        })
    });

    // ws.send('You have connected');
});
