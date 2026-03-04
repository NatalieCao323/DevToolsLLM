const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
    });

    const sendUpdate = (data) => {
        ws.send(JSON.stringify(data));
    };

    // Example: Mock sending data
    setInterval(() => {
        sendUpdate({ type: 'tool-call', message: 'Tool call in progress...' });
    }, 5000);

    setInterval(() => {
        sendUpdate({ type: 'error-update', message: 'No errors detected.' });
    }, 7000);

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server running on ws://localhost:8080');