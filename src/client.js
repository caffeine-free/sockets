const net = require('net');
const fs = require('fs');

const client  = new net.Socket();
client.connect({ port: 4444 });

client.on('connect', () => {
	client.setEncoding('utf8');

	const fileList = []
	fs.readdirSync('./tests/').forEach(file => { fileList.push(file) });

	const randomFile = fileList[Math.floor(Math.random() * fileList.length)];
	const data = fs.readFileSync(`./tests/${randomFile}`, { encoding: 'utf8' });
	const dataSplit = data.split('\r\n');	

	const operations = [];
	dataSplit.forEach(str => {
		if (!str.startsWith('//') && str != '')
			operations.push(str);
	});

	console.log('Client: connection established with server');

	const address = client.address();
	console.log(`Client is listening at port: ${address.port}`);
	client.write(operations.shift());	
	
	client.on('data', data => {
		data = JSON.parse(data);
		
		if (data.output) {
			let input = operations.shift();

			if (data.output !== true) process.stdout.write(data.output);		
			client.write(JSON.stringify({ input, client: data.client }));

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