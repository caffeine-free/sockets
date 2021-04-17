const net = require('net');
const fs = require('fs');

const client  = new net.Socket();
client.connect({ port: 4444 });

const operations = readFile();

client.on('connect', () => {
	client.setEncoding('utf8');

	const address = client.address()
	console.log('Client: connection established with server');
	console.log(`Client is listening at port: ${address.port}`);
	client.write(JSON.stringify({ operations: operations.shift() }));	
	
	client.on('data', async data => {
		await new Promise(r => setTimeout(r, 100));

		data = JSON.parse(data);
		if (data.output) {
			if (data.output === 'close') {
				process.exit();

			} else if (data.output === 'wait') {
				client.write(JSON.stringify({ 
					input: data.operations,
					client: data.client
				}));

			} else {
				let input = operations.shift();

				if (data.output !== 'connected') process.stdout.write(data.output);
				client.write(JSON.stringify({ input, client: data.client }));
			}

		} else if (data.input) {
			let regC = /[b-df-hj-np-tv-z]/gi;
			let regV = /[aeiou]/gi;
			let regN = /\d/gi;

			let consoants = data.input.match(regC)?.length || 0;
			let vowels = data.input.match(regV)?.length || 0;
			let numbers = data.input.match(regN)?.length || 0;

			if (consoants == 0 && vowels == 0 && numbers == 0) {
				client.write(JSON.stringify({ output: 'erro\n', client: data.client }));
			} else {
				let output = `C=${consoants};V=${vowels};N=${numbers}\n`;
				client.write(JSON.stringify({ output, client: data.client }));
			}
		}
	});
});

function readFile() {;
	let data = fs.readFileSync(`./tests/${process.argv[2]}`, { encoding: 'utf8' });
	let dataSplit = data.split('\r\n');

	if (dataSplit.length === 1) dataSplit = data.split('\n');

	let operations = [];
	dataSplit.forEach(str => {
		if (!str.startsWith('//') && str != '')
			operations.push(str);
	});

	if (Number(operations[0]) !== operations.length - 1) {
		console.log('Invalid file!');
		process.exit();
	}

	return operations;
}