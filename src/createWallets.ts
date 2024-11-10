import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import inquirer from 'inquirer';

async function createWallets() {
    // Fonction pour créer un wallet
    const createSingleWallet = () => {
        const wallet = Keypair.generate();
        const walletData = {
            publicKey: wallet.publicKey.toString(),
            privateKey: Array.from(wallet.secretKey)
        };

        if (!fs.existsSync('./wallets')) {
            fs.mkdirSync('./wallets');
        }
        fs.writeFileSync(
            `./wallets/wallet-${walletData.publicKey.slice(0, 8)}.json`,
            JSON.stringify(walletData, null, 2)
        );
        console.log(`Wallet créé avec succès! Clé publique: ${walletData.publicKey}`);
    };

    async function mainMenu() {
        while (true) {
            const { choice } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'choice',
                    message: 'Que voulez-vous faire?',
                    choices: [
                        'Créer un nouveau wallet',
                        'Créer plusieurs wallets',
                        'Quitter'
                    ]
                }
            ]);

            switch (choice) {
                case 'Créer un nouveau wallet':
                    createSingleWallet();
                    await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'continue',
                            message: 'Appuyez sur Enter pour continuer...'
                        }
                    ]);
                    break;

                case 'Créer plusieurs wallets':
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

                    for (let i = 0; i < amount; i++) {
                        createSingleWallet();
                    }
              
                    console.log(`\n${amount} wallets ont été créés avec succès!`);
                    await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'continue',
                            message: 'Appuyez sur Enter pour continuer...'
                        }
                    ]);
                    break;

                case 'Quitter':
                    console.log('Au revoir!');
                    return;
            }
        }
    }

    console.clear();
    console.log("Générateur de Wallets Solana");
    console.log("---------------------------\n");
    await mainMenu();
}

export default createWallets;