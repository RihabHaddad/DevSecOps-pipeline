const Kafka = require('node-rdkafka');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const kafkaConf = {
    'group.id': 'my-consumer-group',
    'metadata.broker.list': '192.168.136.7:9092'
};

const topicName = 'rawdata';

const consumer = new Kafka.KafkaConsumer(kafkaConf, {});

consumer.connect();

const sseConnections = new Map();

consumer.on('ready', () => {
    consumer.subscribe([topicName]);
    consumer.consume();
});

consumer.on('data', (message) => {
    const messageValue = message.value.toString();
    const data = JSON.parse(messageValue);

    const currentSpeed = parseFloat(data.SPEED);
    const driverId = data.DriverId;

    if (currentSpeed > 100) {
        const notification = {
            driverId,
            speed: currentSpeed,
            message: `Driver ${driverId} has exceeded the speed limit with a speed of ${currentSpeed} km/h`
        };

        const sseResponse = `data: ${JSON.stringify(notification)}\n\n`;
        if (sseConnections.has(driverId)) {
            sseConnections.get(driverId).forEach(connection => {
                connection.write(sseResponse);
            });
        }
    }
});

app.use(express.static(__dirname + '/public'));

app.get('/sse/:driverId', (req, res) => {
    const driverId = req.params.driverId;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*' // Allow CORS
    });

    if (!sseConnections.has(driverId)) {
        sseConnections.set(driverId, []);
    }
    
    sseConnections.get(driverId).push(res);

    req.on('close', () => {
        const connections = sseConnections.get(driverId);
        const index = connections.indexOf(res);
        if (index !== -1) {
            connections.splice(index, 1);
            if (connections.length === 0) {
                sseConnections.delete(driverId);
            }
        }
    });
});

server.listen(8002, () => {
    console.log('Server is listening on port 4000');
});
