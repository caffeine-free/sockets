var net = require('net');
var fs = require('fs');

var client  = new net.Socket();
client.connect({
  	port:4444
});

client.on('connect', function() {
	const operations = [];
	const data = fs.readFileSync('./modelo_entrada.txt', {encoding:'utf8'});
	var dataSplit = data.split("\r\n");

	for (let index = 0; index < dataSplit.length; index++) {
		if (!dataSplit[index].startsWith("//") && dataSplit[index] != "") {
			operations.push(dataSplit[index]);
		}
	}
	
  	console.log('Client: connection established with server');

    var address = client.address();
    var port = address.port;
    console.log('Client is listening at port: ' + port);

	client.write(operations[0]);

    client.on('data', function(data) {
		 
    });
});

// let regC = /[\w^aeiou\d_]*/gi;

// var str = "abcdefghij1!2345cAE";

// var a = str.match(regC);

// console.log(a);


/*
[^aeiouAEIOU]* [aeiouAEIOU]* \d*
*/