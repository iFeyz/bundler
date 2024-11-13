import inquirer from 'inquirer';
import { createWallets } from './src/createWallets';
import {checkBalance} from './src/actions/checkBalance';
import {manageWallets} from './src/manageWallets';
import {createLUT} from './src/actions/createLUT';
import {extendLUT} from './src/actions/extendLUT';
import {createToken} from './src/createToken';
import setBuyAmount from './src/actions/setBuyAmount';
//import createTokenAndBuyIt from './src/actions/createTokenAndBuyIt';
const displayMainMenu = async () => {
    while(true){
        const choices = [
            "Create new token",
            "Manage wallets",
            "Buy token",
            "Manage sell",
            "Exit"
        ];

        const { selectedOption } = await inquirer.prompt([{
            type: "list",
            name: "selectedOption",
            message: "Veuillez choisir une option:",
            choices: choices
        }])

        switch(selectedOption){
            case choices[0]:
                await displayCreateTokenMenu();
                break;
            case choices[1]:
                await displayManageWalletsMenu();
                break;
            case choices[2]:
              //  await displayBuyTokenMenu();
                break;
            case choices[3]:
            //    await displayManageSellMenu();
                break;
            case choices[4]:
                console.log("See you soon!");
                process.exit(0);
        }
    }
}

const displayCreateTokenMenu = async () => {
    while(true){
        const choices = [
            "Create LUT", // Create a lookup table
            "Extend LUT", // Expend the lookup table TODO : Verify if the LUT is already created
            "Create token and buy it",
            "Back to main menu" // Create a token and buy it with all the wallets
        ];

        const { selectedOption } = await inquirer.prompt([{
            type: "list",
            name: "selectedOption",
            message: "Veuillez choisir une option:",
            choices: choices
        }])

        switch(selectedOption){
            case choices[0]:
                await createLUT();
                break;
            case choices[1]:
              await extendLUT();
                break;
            case choices[2]:
               await createToken();
                break;
            case choices[3]:
                return;
        }
    }
}
const displayManageWalletsMenu = async () => {
    while(true){
        const choices = [
            "Create new wallets",
            "Check balance",
            "Set buy amount",
            "Back to main menu"
        ]

        const { selectedOption } = await inquirer.prompt([{
            type: "list",
            name: "selectedOption",
            message: "Veuillez choisir une option:",
            choices: choices
        }])

        switch(selectedOption){
            case choices[0]:
                const { choice } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'choice',
                        message: 'Créer des wallets supprimer les existants , continuez ?',
                    }
                ]);
                if (choice){
                    const { amount } = await inquirer.prompt([
                        {
                            type: 'number',
                            name: 'amount',
                            message: 'Combien de wallets voulez-vous créer?',
                            validate: (value) => {
                                if (value && value > 0) return true;
                                return 'Veuillez entrer un nombre positif';
                            }
                        }
                    ]);
                    await createWallets(amount);
                }
                break;
            case choices[1]:
                await checkBalance();
                break;
            case choices[2]:
                const { solAmount } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'solAmount',
                        message: 'Combien de SOL répartir entre les wallets?',
                    }
                ]);
                await setBuyAmount(solAmount);
                break;
            case choices[3]:
                return;
        }
    }
}

const displayCreateWallets = async () => {
    while(true){
        const choices = [
            "Create new wallets including a main wallet",
            "Create a single wallet",
            "Back to main menu"
        ]
    }
    
}


const displayImportWalletsMenu = async () => {
    // TODO: Implement the import wallets menu
    console.log("Import wallets");
}

displayMainMenu();
