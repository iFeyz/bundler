import * as dotenv from 'dotenv';
import { PublicKey, Keypair, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';

dotenv.config();

export const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

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

export const connection = new Connection(rpc);
export const connectionTestnet = new Connection("https://api.devnet.solana.com");
export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
export const PUMP_PROGRAM : PublicKey = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
export const mintAuthority = new PublicKey("TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM");
export const eventAuthority = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");
export const global = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
export const feeRecipient = new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM");


export const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(`./wallet-main/wallet-main.json`, "utf-8")).privateKey)
);
export const payer = Keypair.fromSecretKey(
    Uint8Array.from([65,123,49,95,224,50,129,188,220,44,67,59,91,66,37,213,47,94,239,38,23,150,236,225,213,16,97,22,193,251,163,98,17,254,237,143,120,234,27,139,209,114,174,129,110,36,88,144,237,9,247,24,154,22,248,249,145,217,80,254,78,76,227,127]

    )
);

