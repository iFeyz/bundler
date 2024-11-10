import inquirer from 'inquirer';
import createWallets from './createWallets';
import checkBalance from './actions/checkBalance';

const manageWallets = async () => {
    const {choice} = await inquirer.prompt([{
        type: 'list',
        name: 'choice',
        message: 'Manage wallets',
        choices: ['Check balance', 'Achat par wallet']
    }]);

    switch(choice){
        case 'Check balance':
            await checkBalance();
            break;
        case 'Achat par wallet':
            console.log('Achat par wallet');
            break;
    }
}