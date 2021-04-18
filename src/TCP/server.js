const net = require('net');
const fs = require('fs');

const server = net.createServer();  
const clients = new Map();

var operations = 0;
var processed = 0;

server.on('connection', client => {
  console.log(`\nClient is listening at port: ${client.remotePort}`);
	server.getConnections((err, count) => {
    console.log(`Number of current connections to the server: ${count}`);
	});

	client.on('data', data => {
    let keys = Array.from(clients.keys());
    data = JSON.parse(data);

    if (!clients.get(client)) {
      clients.set(client, []);

      if (data.operations) operations += Number(data.operations);
      client.write(JSON.stringify({ output: 'connected', client }));

    } else if (data.input) {
      let randomClient = keys[Math.floor(Math.random() * keys.length)];

      if (randomClient === client)
        randomClient.write(JSON.stringify({ 
          output: 'wait', 
          operations: data.input, 
          client: data.client 
        }));
      else
        randomClient.write(JSON.stringify(data));

    } else if (data.output) {
      let client = keys.find(c => c.remotePort === data.client._peername.port);
      
      clients.get(client).push(data.output);
      client.write(JSON.stringify({ output: data.output, client: data.client }));
      processed += 1;

    } else if (processed === operations) {
      client.write(JSON.stringify({ output: 'close' }));

    } else {
      client.write(JSON.stringify({ output: 'wait', client: data.client }));
    }
	});

	client.on('error', err => {
    console.log(`Error : ${err}`);
	});

	client.on('close', () => {
		console.log('Socket closed!');
    
    let path = `./out/${client.remotePort}.txt`;
    fs.writeFileSync(path, clients.get(client).join(''), { flag: 'w' });
    clients.delete(client);

    if (!clients.size) process.exit();
	});
});

server.listen(4444, () => {
	let address = server.address();
	console.log(`Server is listening at port: ${address.port}`);
	console.log(`Server is IP4/IP6 : ${address.family}`);
});