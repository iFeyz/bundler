import {
	PublicKey,
	VersionedTransaction,
	TransactionInstruction,
	SYSVAR_RENT_PUBKEY,
	TransactionMessage,
	SystemProgram,
	Keypair,
	LAMPORTS_PER_SOL,
	AddressLookupTableAccount,
} from "@solana/web3.js";
import { loadKeypairs } from "../utils/utils";
import fs from "fs";
import { Spl } from "@raydium-io/raydium-sdk";
import * as spl from "@solana/spl-token";
import { feeRecipient, payer, PUMP_PROGRAM } from "../../config";
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import BN from "bn.js";
import { global , eventAuthority } from "../../config";
import { Program } from "@coral-xyz/anchor";
import { getRandomTipAccount } from "../clients/config";

export async function createWalletSwaps(
	blockhash: string,
	keypairs: Keypair[],
	lut: AddressLookupTableAccount,
	bondingCurve: PublicKey,
	associatedBondingCurve: PublicKey,
	mint: PublicKey,
	program: Program
): Promise<VersionedTransaction[]> {
    const txsSigned: VersionedTransaction[] = [];
    const dataPool = fs.readFileSync(`./pool/info.json`);
    const pool = JSON.parse(dataPool.toString());
    const mintKp = Keypair.fromSecretKey(Uint8Array.from(bs58.decode(pool.mintPk)));

    //Load keyInfo from JSON file
    const keyInfo = await loadKeypairs();
    let e =0
        const initIxs : TransactionInstruction[] = [];
        

        for(let i =0; i < keypairs.length; i++){
            const walletData = JSON.parse(fs.readFileSync(`./wallets/wallet-${keyInfo[i].publicKey.toBase58().slice(0, 8)}.json`, 'utf-8'));
            const walletPubkey = new PublicKey(walletData.publicKey);
            const ataAddress = spl.getAssociatedTokenAddressSync(mint, walletPubkey);
            const createTokenAta = spl.createAssociatedTokenAccountIdempotentInstruction(payer.publicKey , ataAddress , walletPubkey , mint);
            const amount = new BN(walletData.tokenAmount, 16);
            const solAmount = new BN(100000 * walletData.solAmount * LAMPORTS_PER_SOL);
            const [bondingCurveAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("bonding-curve"), mintKp.publicKey.toBytes()], 
                program.programId
            )

            const account3 = bondingCurveAddress;
            const account4 = global;
            const account7 = feeRecipient;
            //CONSOLE LOG TOUTES LES ADDRESSES
            console.log(`createTokenAta: ${createTokenAta}`);
            console.log(`systemProgram: ${SystemProgram.programId}`);
            console.log(`tokenProgram: ${spl.TOKEN_PROGRAM_ID}`);
            console.log(`rent: ${SYSVAR_RENT_PUBKEY}`);
            console.log(`global: ${account4}`);
            console.log(`feeRecipient: ${account7}`);
            console.log(`eventAuthority: ${eventAuthority}`);
            console.log(`mint: ${mint}`);
            console.log(`program: ${PUMP_PROGRAM}`);
            console.log(`bondingCurve: ${bondingCurve}`);
            console.log(`associatedBondingCurve: ${associatedBondingCurve}`);
            console.log(`associatedUser: ${ataAddress}`);
            console.log(`user: ${walletData.publicKey}`);
   
            const buyIx = await program.methods
                .buy(amount , solAmount)
                .accounts({
                    systemProgram: SystemProgram.programId,
                    tokenProgram: spl.TOKEN_PROGRAM_ID,
                    rent: SYSVAR_RENT_PUBKEY,
                    global : account4,
                    feeRecipient : account7,
                    eventAuthority,
                    mint : mint,
                    program : PUMP_PROGRAM,
                    bondingCurve : bondingCurve,
                    associatedBondingCurve : associatedBondingCurve,
                    associatedUser: ataAddress,
                    user: walletData.publicKey,
            
               
            
                
        
                
                })
                .instruction();
            initIxs.push(createTokenAta,buyIx);
            e++
        }
        const tipIxn = SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: getRandomTipAccount(),
            lamports: BigInt(0.001*LAMPORTS_PER_SOL),
        })
        initIxs.push(tipIxn);
        const messageV0 = new TransactionMessage({
            payerKey : payer.publicKey,
            recentBlockhash : blockhash,
            instructions : initIxs,
        }).compileToV0Message([lut]);

        const fullTx = new VersionedTransaction(messageV0);
        fullTx.sign([payer]);
        for(const kp of keypairs){
            fullTx.sign([kp]);
        }
        txsSigned.push(fullTx);
        return txsSigned;
    }






