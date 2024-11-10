import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as fs from 'fs';
import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import { loadKeypairs } from '../utils/utils';
dotenv.config();

async function checkBalance(){
    const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
    //Lire les wallets dans le dossier wallets
    const getWallets = ()=>{
        if (!fs.existsSync('./wallets')){
            console.log('Le dossier wallets n\'existe pas veuillez créer des wallets');
            return [];
        }
        return fs.readdirSync('./wallets')
            .filter((file)=>file.endsWith('.json'))
            .map((file)=>{
                const data = JSON.parse(fs.readFileSync(`./wallets/${file}`, 'utf8'));
                return {
                    publicKey: data.publicKey,
                    fileName: file
                };
            });
    }

    const checkWalletBalance = async(publicKeyStr : string) =>{
        try {
            const publicKey = new PublicKey(publicKeyStr);
            const balance = await connection.getBalance(publicKey);
            return balance / LAMPORTS_PER_SOL;
        } catch (error) {
            console.error(`Erreur lors de la vérification de la balance de la wallet ${publicKeyStr}:`, error);
            return 0;
        }
    };
    const checkMainWalletBalance = async() =>{
        const mainWallet = process.env.MAIN_WALLET_PUBLIC_KEY;
        if (!mainWallet){
            console.log('La clé publique du main wallet n\'est pas définie dans le fichier .env');
            return;
        }
        const balance = await checkWalletBalance(mainWallet);
        console.log(`Solde du main wallet: ${balance} SOL`);
    }

    async function displayWalletBalances(){
        const wallets = getWallets();
        if (wallets.length === 0){
            console.log('Aucune wallet trouvée');
            return;
        }
        console.log("\n Récupération des balances des wallets...");

        const balances = await Promise.all(wallets.map(async(wallet)=>{
            const balance = await checkWalletBalance(wallet.publicKey);
            return {
                ...wallet,
                balance
            };
        }));
        console.clear();
        console.log('Soldes des wallets:');
        console.log('------------------');
        balances.forEach(({ publicKey, balance, fileName }) => {
            console.log(`\nWallet: ${fileName}`);
            console.log(`Public Key: ${publicKey}`);
            console.log(`Solde: ${balance} SOL`);
        });
    }

    async function mainMenu(){
        while (true){
            const {choice} = await inquirer.prompt([{
                type: 'list',
                name: 'choice',
                message: 'Que voulez vous faire ?',
                choices: ['Vérifier les soldes des wallets',  "Vérifier solde du main wallet",  'Quitter']
            }]);

            switch(choice){
                case 'Vérifier les soldes':
                    await displayWalletBalances();
                    break;
                case 'Vérifier solde du main wallet':
                    await checkMainWalletBalance();
                    break;
                case 'Quitter':
                    return;
            }
        }

    }

    console.clear();
    console.log("Vérificateur de Soldes Solana");
    console.log("-----------------------------\n");
    await mainMenu();
}

export default checkBalance;