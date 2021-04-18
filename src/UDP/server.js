const net = require('dgram');
const fs = require('fs');

const server = net.createSocket('udp4');  
const clients = new Map();

var operations = 0;
var processed = 0;

server.on('message', async (data, client) => {
  let keys = Array.from(clients.keys());
  data = JSON.parse(data);

  if (!clients.get(client.port)) {
    clients.set(client.port, []);

    if (data.operations) operations += Number(data.operations);
    await delay();
    server.send(JSON.stringify({ output: 'connected', client }), client.port, client.address);

  } else if (data.input) {
    let randomClient = keys[Math.floor(Math.random() * keys.length)];

    if (randomClient === client.port) {
      await delay();
      server.send(JSON.stringify({ 
        output: 'wait', 
        operations: data.input, 
        client: data.client 
      }), client.port);
    }
    else {
      await delay();
      server.send(JSON.stringify(data), randomClient);
    }

  } else if (data.output) {
    let client = keys.find(c => c === data.client.port);
    
    clients.get(client).push(data.output);
    await delay();
    server.send(JSON.stringify({ output: data.output, client: data.client }), client);
    processed += 1;

  } else if (data.close) {
    let path = `./out/${client.port}.txt`;
    fs.writeFileSync(path, clients.get(client.port).join(''), { flag: 'w' });
    clients.delete(client.port);
    if (!clients.size) {
      server.close();
    }

  } else if (processed === operations) {
    await delay();
    server.send(JSON.stringify({ output: 'close' }), client.port, client.address);
  } else {
    await delay();
    server.send(JSON.stringify({ output: 'wait', client: data.client }), client.port, client.address);
  }

  setTimeOut();
});

server.on('error', err => {
  console.log(`Error : ${err}`);
});

server.on('close', () => {
  console.log('Socket closed!');
  process.exit();
});

server.bind(4444, () => {
	let address = server.address();
	console.log(`Server is listening at port: ${address.port}`);
	console.log(`Server is IP4/IP6 : ${address.family}`);
});

async function delay() {
  return new Promise(r => setTimeout(r, Math.random() * (500 - 200) + 200));
}

function setTimeOut() {
  setTimeout(function(){
    if (!clients.size) {
      server.close();
    }
    },60000);
}

setTimeOut();