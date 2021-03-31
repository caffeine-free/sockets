const net = require('net');
const server = net.createServer();  
var clients = new Map();

server.on('connection', function (client) {     
  client.setEncoding('utf8');
	
	var rport = client.remotePort;
	
	console.log('\nClient is listening at port: ' + rport);

	server.getConnections(function (error, count) {
    console.log('Number of concurrent connections to the server : ' + count);
	});

	client.on('data', function (data) {
    if (clients.get(client) == null) {
      clients.set(client, data);
      var object = {
        "output" : "start",
        "client": client
	  	}
      client.write(JSON.stringify(object));
    }
    else {
      data = JSON.parse(data);
      if (data.input) {
        let keys = Array.from(clients.keys());
        let randomClient = keys[Math.floor(Math.random() * keys.length)];
        randomClient.write(JSON.stringify(data));
      }
      else if(data.output) {
        var object = {
          "output" : data.output,
          "client" : data.client
        }
        let keys = Array.from(clients.keys());
        let client = keys.find(c => c.remotePort === data.client._peername.port);
        client.write(JSON.stringify(object));
      }
    }
	});

	client.on('error', function (error) {
    console.log('Error : ' + error);
	});

	client.on('close', function (error) {
		console.log('Socket closed!');
		if(error) {
      console.log(error);
    }
	});
});

server.listen(4444, function() {
	var address = server.address();
	var port = address.port;
	var family = address.family;
	console.log('Server is listening at port: ' + port);
	console.log('Server is IP4/IP6 : ' + family);
});
