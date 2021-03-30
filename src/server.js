const net = require('net');
const server = net.createServer();  
var id = 0;
var clients = new Map();

server.on('connection', function (client) {     
    var lport = client.localPort;
    var rport = client.remotePort;

    console.log('\nClient is listening at port: ' + rport);

    server.getConnections(function (error, count) {
        console.log('Number of concurrent connections to the server : ' + count);
    });

    client.setEncoding('utf8');

    client.on('data', function (data) {
		console.log(data);
		clients.set(client, data);
		console.log(clients);
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