import readline from 'readline';
import CalculatorStub from './stubs/calculatorStub.js';

const HOST = process.argv[2] || 'localhost';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Configuration: define available operations with number of params
const operations = {
    '1': { className: 'calculator', method: 'add', params: 2, paramTypes: ['number', 'number'] },
    '2': { className: 'calculator', method: 'subtract', params: 2, paramTypes: ['number', 'number'] },
    '3': { className: 'calculator', method: 'multiply', params: 2, paramTypes: ['number', 'number'] },
    '4': { className: 'calculator', method: 'divide', params: 2, paramTypes: ['number', 'number'] }
};

function showMenu() {
    console.log('\nCalculator:');
    console.log('1. add(a, b)');
    console.log('2. subtract(a, b)');
    console.log('3. multiply(a, b)');
    console.log('4. divide(a, b)');
    console.log('5. Exit');

    rl.question('\nSelect: ', (choice) => {
        if (choice === '5') {
            console.log('Exiting...');
            rl.close();
            process.exit(0);
        }
        
        const op = operations[choice];
        if (!op) {
            console.log('Invalid choice');
            return showMenu();
        }
        
        getParams(op);
    });
}

// Function to collect N parameters based on operation config
function getParams(operation) {
    const params = [];
    let count = 0;
    
    function askNext() {
        if (count < operation.params) {
            const paramType = operation.paramTypes[count];
            rl.question(`Value ${count + 1}: `, (value) => {
                // Convert based on type
                if (paramType === 'number') {
                    params.push(parseFloat(value));
                } else {
                    params.push(value);
                }
                count++;
                askNext();
            });
        } else {
            invokeRemote(operation.className, operation.method, params);
        }
    }
    
    askNext();
}

// Remote invocation
async function invokeRemote(className, method, params) {
    try {
        // Create stub for the specific class
        const StubClass = (await import(`./stubs/calculatorStub.js`)).default;
        const stub = new StubClass(HOST);
        stub.className = className;
        
        const result = await stub[method](...params);
        console.log('> Result:', result);
    } catch (err) {
        console.error('> Error:', err.message);
    }
    showMenu();
}

showMenu();