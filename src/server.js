const net = require('net');
const fs = require('fs');

const server = net.createServer();  
const clients = new Map();

server.on('connection', client => {     
  client.setEncoding('utf8');
  
  console.log(`\nClient is listening at port: ${client.remotePort}`);
	server.getConnections((err, count) => {
    console.log(`Number of current connections to the server: ${count}`);
	});

	client.on('data', data => {
    let keys = Array.from(clients.keys());

    if (!clients.get(client)) {
      clients.set(client, []);
      client.write(JSON.stringify({ output: true, client }));

    } else {
      data = JSON.parse(data);
      
      if (data.input) {
        let randomClient = keys[Math.floor(Math.random() * keys.length)];
        randomClient.write(JSON.stringify(data));

      } else if (data.output) {
        let client = keys.find(c => c.remotePort === data.client._peername.port);
        
        clients.get(client).push(data.output);
        client.write(JSON.stringify({ output: data.output, client: data.client }));
      }
    }
	});

	client.on('error', err => {
    console.log(`Error : ${err}`);
	});

	client.on('close', err => {
		console.log('Socket closed!');
    
    let path = `./out/${client.remotePort}.txt`;
    fs.writeFileSync(path, clients.get(client).join(''), { flag: 'w' });
    clients.delete(client);
    
		if (err) throw err;
	});
});

server.listen(4444, () => {
	let address = server.address();
	console.log(`Server is listening at port: ${address.port}`);
	console.log(`Server is IP4/IP6 : ${address.family}`);
});