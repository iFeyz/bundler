import { PublicKey } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import BN from "bn.js";


// Create type walletBuy for wallet buy specific params
export type walletBuy = {
    solAmount: number;
    tokenAmount: BN;
    percent: number;
    percentSupply: number;
}

