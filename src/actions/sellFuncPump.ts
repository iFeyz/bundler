import { Keypair, PublicKey, TransactionMessage, VersionedTransaction, SystemProgram, SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { connection, rpc, wallet, global, feeRecipient, PUMP_PROGRAM, payer , eventAuthority} from "../../config";
import fs from "fs";
import * as spl from '@solana/spl-token';
import { loadKeypairs } from "../utils/utils";
import { chunkArray } from "@raydium-io/raydium-sdk";
import { BN } from "@coral-xyz/anchor";
import { getRandomTipAccount } from "../clients/config";
import sendBundle from "./sendBundle";
export async function sellXPercentagePF(supplyPercent : number){
    const provider = new anchor.AnchorProvider(new anchor.web3.Connection(rpc), new anchor.Wallet(wallet), {commitment: 'confirmed'});
	const IDL_PumpFun = JSON.parse(fs.readFileSync("./pumpfun-IDL.json", "utf-8")) as anchor.Idl;
    const program = new anchor.Program(IDL_PumpFun, PUMP_PROGRAM, provider);

    const bundledTxns = [];
    const keypairs = loadKeypairs();
    let poolInfoData =  fs.readFileSync("./pool/info.json", "utf-8");
    let poolInfo = JSON.parse(poolInfoData);
    const lut = new PublicKey(poolInfo.lut);
    const lookupTableAccount = (await connection.getAddressLookupTable(lut)).value;
    if (lookupTableAccount == null) {
		console.log("Lookup table account not found!");
		process.exit(0);
	}
    const mintKp = Keypair.fromSecretKey(poolInfo.mintPk);
    const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-curve"), mintKp.publicKey.toBytes()], 
        program.programId
    )
    const associatedBondingCurve = spl.getAssociatedTokenAddressSync(mintKp.publicKey, bondingCurve , true );
    const mintInfo = await connection.getTokenSupply(mintKp.publicKey)
    let sellTotalAmount = 0;
    const chunkedKeypairs = chunkArray(keypairs, 6);
    const PayerTokenATA = await spl.getAssociatedTokenAddress(new PublicKey(poolInfo.mint), payer.publicKey);
    const { blockhash} = await connection.getLatestBlockhash()

    for ( let chunkIndex = 0; chunkIndex < chunkedKeypairs.length; chunkIndex++){
        const chunk = chunkedKeypairs[chunkIndex];
        const instructionsForChunk = [];
        const isFirstChunk = chunkIndex === 0;

        if(isFirstChunk){
            const transferAmount = await getSellBalance(wallet , new PublicKey(poolInfo.mint), supplyPercent);
            sellTotalAmount += transferAmount;
            console.log(`Sending ${transferAmount / 1e6} from dev wallet`);
            const ataIx = spl.createAssociatedTokenAccountIdempotentInstruction(payer.publicKey, PayerTokenATA, payer.publicKey, mintKp.publicKey);
            const tokenATA = await spl.getAssociatedTokenAddress(new PublicKey(poolInfo.mint), wallet.publicKey);
            const transferIx = spl.createTransferInstruction(tokenATA, PayerTokenATA, wallet.publicKey, transferAmount);
            instructionsForChunk.push(ataIx, transferIx);
        }
        for (let keypair of chunk) {
            const transferAmount = await getSellBalance(keypair, new PublicKey(poolInfo.mint), supplyPercent);
            sellTotalAmount += transferAmount;
            console.log(`Sending ${transferAmount / 1e6} from wallet ${keypair.publicKey.toString()}`);
            const tokenATA = await spl.getAssociatedTokenAddress(new PublicKey(poolInfo.mint), keypair.publicKey);
            const transferIx = spl.createTransferInstruction(tokenATA, PayerTokenATA, keypair.publicKey, transferAmount);
            instructionsForChunk.push(transferIx);
        }

        if(instructionsForChunk.length > 0){
            const message = new TransactionMessage({
                payerKey: payer.publicKey,
                recentBlockhash: blockhash,
                instructions: instructionsForChunk
            }).compileToV0Message([lookupTableAccount]);

            const versionedTx = new VersionedTransaction(message);
            const serializedTx = versionedTx.serialize();
            console.log("TXN size: ", serializedTx.length);
            if (serializedTx.length > 1232) {
				console.log("tx too big");
			}
            versionedTx.sign([payer]);
            for (let keypair of chunk){
                versionedTx.sign([keypair]);
            }
            bundledTxns.push(versionedTx);
        }
    }
    const sellPayerIxs = []
	console.log(`TOTAL: Selling ${sellTotalAmount / 1e6}.`);

    const sellIx = await program.methods.sell(new BN(sellTotalAmount) , new BN(0)).accounts({
        global,
        feeRecipient,
        mint: new PublicKey(poolInfo.mint),
        bondingCurve,
        user : payer.publicKey,
        systemProgram: SystemProgram.programId,
        associatedBondingCurve,
        associatedUser: PayerTokenATA,
        program: PUMP_PROGRAM,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        eventAuthority,
        rent: SYSVAR_RENT_PUBKEY,

    }).instruction();

    sellPayerIxs.push(
        sellIx,
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: getRandomTipAccount(),
            lamports: BigInt(0.0001 * LAMPORTS_PER_SOL)
        })
    );

    const sellMessage = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions: sellPayerIxs
    }).compileToV0Message([lookupTableAccount]);

    const sellVersionedTx = new VersionedTransaction(sellMessage);
    const serializedTx = sellVersionedTx.serialize();
    console.log("TXN size: ", serializedTx.length);
    if (serializedTx.length > 1232) {
		console.log("tx too big");
	}
    sellVersionedTx.sign([payer]);
    bundledTxns.push(sellVersionedTx);
    await sendBundle(bundledTxns);
    return;

}

async function getSellBalance(keypair: Keypair, mint: PublicKey, supplyPercent: number) {
	let amount;
	try {
		const tokenAccountPubKey = spl.getAssociatedTokenAddressSync(mint, keypair.publicKey);
		const balance = await connection.getTokenAccountBalance(tokenAccountPubKey);
		amount = Math.floor(Number(balance.value.amount) * supplyPercent);
	} catch (e) {
		amount = 0;
	}

	return amount;
}