import inquirer from 'inquirer';
import createWallets  from './src/createWallets';
import checkBalance from './src/actions/checkBalance';
const displayMainMenu = async () => {
    while(true){
        const choices = [
            "Create new token",
            "Create new wallets",
            "Manage wallets",
            "Import wallets",
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
                await displayCreateWalletMenu();
                break;
            case choices[2]:
                await displayManageWalletsMenu();
                break;
            case choices[3]:
                await displayImportWalletsMenu();
                break;
            case choices[4]:
                console.log("See you soon!");
                process.exit(0);
        }
    }
}

const displayCreateTokenMenu = async () => {
    // TODO: Implement the create new token menu
    while(true){
        const choices = [
            "Create new token",
            "Back to main menu"
        ];

        const { selectedOption } = await inquirer.prompt([{
            type: "list",
            name: "selectedOption",
            message: "Veuillez choisir une option:",
            choices: choices
        }])

        switch(selectedOption){
            case choices[0]:
                console.log("Menu create new token");
                break;
            case choices[1]:
                return;
        }
    }
}

const displayCreateWalletMenu = async () => {
    // TODO: Implement the create new wallet menu
    await createWallets();
}

const displayManageWalletsMenu = async () => {
    // TODO: Implement the manage wallets menu
    await checkBalance();
}

const displayImportWalletsMenu = async () => {
    // TODO: Implement the import wallets menu
    console.log("Import wallets");
}

displayMainMenu();
