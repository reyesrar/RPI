import readline from 'readline';
import CalculatorStub from './stubs/calculatorStub.js';

const stub = new CalculatorStub(process.argv[2]);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const operations = {
    '1': 'add',
    '2': 'subtract',
    '3': 'multiply',
    '4': 'divide'
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

function getParams(op) {
    rl.question('Value 1: ', (v1) => {
        rl.question('Value 2: ', async (v2) => {
            const a = parseFloat(v1);
            const b = parseFloat(v2);
            try {
                const result = await stub[op](a, b);
                console.log('> Result:', result);
            } catch (err) {
                console.error('> Error:', err.message);
            }
            showMenu();
        });
    });
}

showMenu();
