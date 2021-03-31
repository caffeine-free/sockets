const net = require('net');
const server = net.createServer();  
const clients = new Map();

server.on('connection', client => {     
  client.setEncoding('utf8');
  
  console.log(`\nClient is listening at port: ${client.remotePort}`);
	server.getConnections((error, count) => {
    console.log(`Number of concurrent connections to the server : ${count}`);
	});

	client.on('data', data => {
    let keys = Array.from(clients.keys());

    if (!clients.get(client)) {
      clients.set(client, data);
      client.write(JSON.stringify({ output: true, client }));

    } else {
      data = JSON.parse(data);
      
      if (data.input) {
        let randomClient = keys[Math.floor(Math.random() * keys.length)];
        randomClient.write(JSON.stringify(data));

      } else if (data.output) {
        let client = keys.find(c => c.remotePort === data.client._peername.port);
        client.write(JSON.stringify({ output: data.output, client: data.client }));
      }
    }
	});

	client.on('error', error => {
    console.log(`Error : ${error}`);
	});

	client.on('close', error => {
		console.log('Socket closed!');
		if (error)
      console.log(error);
	});
});

server.listen(4444, () => {
	let address = server.address();
	console.log(`Server is listening at port: ${address.port}`);
	console.log(`Server is IP4/IP6 : ${address.family}`);
});
