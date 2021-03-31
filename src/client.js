var net = require('net');
var fs = require('fs');

var client  = new net.Socket();
client.connect({
	port:4444
});

client.on('connect', function() {
	client.setEncoding('utf8');

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

	client.write(operations.shift());	

	client.on('data', function(data) {
		data = JSON.parse(data);
		if (data.output) {
			var object = {
				"input" : operations.shift(),
				"client" : data.client
			}

			console.log(data.output);
			client.write(JSON.stringify(object));
		}
		else if (data.input) {
			console.log(data.input);
			var regC = /[b-df-hj-np-tv-z]/gi;
			var regV = /[aeiou]/gi;
			var regN = /\d/gi;

			var consoants = data.input.match(regC)?.length;
			var vowels = data.input.match(regV)?.length;
			var numbers = data.input.match(regN)?.length
			
			if (!consoants) {
				consoants = 0;
			}
			if (!vowels) {
				vowels = 0;
			}
			if (!numbers) {
				numbers = 0;
			}

			if (consoants == 0 && vowels == 0 && numbers == 0) {
				var object = {
					"output" : "erro",
					"client" : data.client
				}
				client.write(JSON.stringify(object));
			}
			else {
				var output = `C=${consoants};V=${vowels};N=${numbers}`;
				var object = {
					"output" : output,
					"client" : data.client
				}
				client.write(JSON.stringify(object));
			}
		}
	});
});