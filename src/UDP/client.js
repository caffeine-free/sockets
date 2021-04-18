const net = require('dgram');
const fs = require('fs');

const client  = new net.Socket('udp4');
client.connect(4444);

const operations = readFile();

client.on('connect', () => {
  const address = client.address()
	console.log('Client: connection established with server');
	console.log(`Client is listening at port: ${address.port}`);
  delay();
	client.send(JSON.stringify({ operations: operations.shift() }));	
	
	client.on('message', async data => {
		await new Promise(r => setTimeout(r, 100));

		data = JSON.parse(data);
		if (data.output) {
			if (data.output === 'close') {
        delay();
        client.send(JSON.stringify({close: 'close'}));
        client.close();
				process.exit();

			} else if (data.output === 'wait') {
        await delay();
				client.send(JSON.stringify({ 
					input: data.operations,
					client: data.client
				}));

			} else {
				let input = operations.shift();

				if (data.output !== 'connected') process.stdout.write(data.output);
        await delay();
				client.send(JSON.stringify({ input, client: data.client }));
			}

		} else if (data.input) {
			let regC = /[b-df-hj-np-tv-z]/gi;
			let regV = /[aeiou]/gi;
			let regN = /\d/gi;

			let consoants = data.input.match(regC)?.length || 0;
			let vowels = data.input.match(regV)?.length || 0;
			let numbers = data.input.match(regN)?.length || 0;

			if (consoants == 0 && vowels == 0 && numbers == 0) {
        await delay();
				client.send(JSON.stringify({ output: 'erro\n', client: data.client }));
			} else {
				let output = `C=${consoants};V=${vowels};N=${numbers}\n`;
        await delay();
				client.send(JSON.stringify({ output, client: data.client }));
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

async function delay() {
  return new Promise(r => setTimeout(r, Math.random() * (500 - 200) + 200));
}