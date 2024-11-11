import inquirer from 'inquirer';
import setBuyAmount from './setBuyAmount';

export default async function buyPerWallets(){
   const {wallet} = await inquirer.prompt([{
    type: 'input',
    name: 'wallet',
    message: 'Quel montant en sol pour achat'
   }]);

   await setBuyAmount(wallet);
}