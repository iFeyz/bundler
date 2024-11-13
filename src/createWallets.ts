import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import inquirer from 'inquirer';




    const createMainWallet = () => {
        const wallet = Keypair.generate();
        const walletData = {
            publicKey: wallet.publicKey.toString(),
            privateKey: Array.from(wallet.secretKey)
        };
        fs.writeFileSync(
            `./wallet-main/wallet-main.json`,
            JSON.stringify(walletData, null, 2)
        );
        console.log(`Wallet principale créée avec succès! Clé publique: ${walletData.publicKey}`);
    }

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

export async function createWallets(amount: number) {
    createMainWallet();
    for (let i = 0; i < amount; i++) {
        createSingleWallet();                
    }
    console.log(`\n${amount} wallets ont été créés avec succès!`);
}
    