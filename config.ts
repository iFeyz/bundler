import * as dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';

dotenv.config();

export function getMainWalletPublicKey(): PublicKey {
    const publicKeyStr = process.env.MAIN_WALLET_PUBLIC_KEY;
    
    if (!publicKeyStr) {
        throw new Error('MAIN_WALLET_PUBLIC_KEY n\'est pas défini dans le fichier .env');
    }

    try {
        return new PublicKey(publicKeyStr);
    } catch (error) {
        throw new Error('MAIN_WALLET_PUBLIC_KEY dans le .env n\'est pas une clé publique Solana valide');
    }
}