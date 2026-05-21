import net from 'net';
import readline from 'readline';

const PORT = 3000;
const HOST = process.argv[2] || 'localhost';

console.log(`Connecting to server`);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function invokeMethod(className, method, params) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        
        client.connect(PORT, HOST, () => {
            console.log('Connected to server');
            
            const request = {
                className: className,
                method: method,
                params: params
            };
            
            client.write(JSON.stringify(request));
        });
        
        client.on('data', (data) => {
            const response = JSON.parse(data.toString());
            
            if (response.success) {
                console.log('> Result:', response.result);
                resolve(response.result);
            } else {
                console.error('> Error:', response.error);
                reject(new Error(response.error));
            }
            client.destroy();
            showMenu();
        });
        
        client.on('error', (err) => {
            console.error(' Connection error:', err.message);
            reject(err);
            showMenu();
        });
    });
}

function showMenu() {
    console.log('\nCalculator:');
    console.log('1. add(a, b)');
    console.log('2. subtract(a, b)');
    console.log('3. multiply(a, b)');
    console.log('4. divide(a, b)');
    console.log('5. Exit');
    
    rl.question('\nSelect: ', (choice) => {
        switch (choice) {
            case '1':
                getParams('calculator', 'add', 2);
                break;
            case '2':
                getParams('calculator', 'subtract', 2);
                break;
            case '3':
                getParams('calculator', 'multiply', 2);
                break;
            case '4':
                getParams('calculator', 'divide', 2);
                break;
            case '5':
                console.log('Exiting...');
                rl.close();
                process.exit(0);
                break;
            default:
                console.log('Invalid choice');
                showMenu();
        }
    });
}

function getParams(className, method, numParams) {
    const params = [];
    let count = 0;
    
    function askNext() {
        if (count < numParams) {
            rl.question(`Value ${count + 1}: `, (value) => {
                params.push(parseFloat(value));
                count++;
                askNext();
            });
        } else {
            invokeMethod(className, method, params);
        }
    }
    
    askNext();
}

showMenu();