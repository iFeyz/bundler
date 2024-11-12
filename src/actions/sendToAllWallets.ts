import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { connection, payer, wallet } from "../../config";
import { Transaction, TransactionInstruction , Keypair, SystemProgram, VersionedTransaction } from "@solana/web3.js";
import fs from 'fs';
import { loadKeypairs } from "../utils/utils";
import { getRandomTipAccount } from "../clients/config";
import sendBundle from "./sendBundle";
import { PublicKey, Blockhash , TransactionMessage } from "@solana/web3.js";
async function sendToAllWallets(){
    const jitoTipAmt = 0.001 * LAMPORTS_PER_SOL;
    const {blockhash} = await connection.getLatestBlockhash();
    const sendTxns : VersionedTransaction[] = [];
    const solIxs = await transactionToAllWalletsBuyer(jitoTipAmt);
    const solTxns = await processInstructionsSOL(solIxs , blockhash);
    sendTxns.push(...solTxns);
    await sendBundle(sendTxns);

}

async function createAndSignVersionedTxWithKeypairs(instructionsChunk: TransactionInstruction[], blockhash: string | Blockhash): Promise<VersionedTransaction> {
    const data = fs.readFileSync('./pool/info.json', 'utf-8');
    const poolInfo = JSON.parse(data);
    console.log(poolInfo);
    const lut = new PublicKey(poolInfo.poolInfo);
    const lookupTableAccount = (await connection.getAddressLookupTable(lut)).value;
    if(!lookupTableAccount){
        throw new Error('Lookup table account not found');
    }


    const message = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions: instructionsChunk
    }).compileToV0Message([lookupTableAccount]);

    const versionedTx = new VersionedTransaction(message);
    versionedTx.sign([payer]);
    return versionedTx;


}
async function processInstructionsSOL(ixs: TransactionInstruction[], blockhash: string | Blockhash): Promise<VersionedTransaction[]> {
	const txns: VersionedTransaction[] = [];
	const instructionChunks = chunkArray(ixs, 45);

	for (let i = 0; i < instructionChunks.length; i++) {
		const versionedTx = await createAndSignVersionedTxWithKeypairs(instructionChunks[i], blockhash);
		txns.push(versionedTx);
	}

	return txns;
}
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}


async function transactionToAllWalletsBuyer(jitoTipAmt: number){
    const txns : TransactionInstruction[] = [];
    const ixs: TransactionInstruction[] = [];
    const keypairs: Keypair[] = [];
    const mainWalletData = JSON.parse(fs.readFileSync('./wallet-main/wallet-main.json', 'utf-8'));

    const solMainAmmount = parseFloat(mainWalletData.solAmount);

    ixs.push(
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: wallet.publicKey,
            lamports: Math.floor((solMainAmmount * 1.015 + 0.0025) * LAMPORTS_PER_SOL)
        })
    )
    const walletKeypairs = await loadKeypairs();
    const numberOfWallets = walletKeypairs.length;
    for(let i = 0; i < numberOfWallets; i++){
        const walletData = JSON.parse(fs.readFileSync(`./wallets/wallet-${walletKeypairs[i].publicKey.toBase58().slice(0, 8)}.json`, 'utf-8'));
        const keypairPubkey = new PublicKey(walletData.publicKey);
        const consoleLogKeypairPubkey = walletData.publicKey
        const solAmount = parseFloat(walletData.solAmount);

        try {
            ixs.push(
                SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: keypairPubkey,
                    lamports: Math.floor((solAmount * 1.015 + 0.0025) * LAMPORTS_PER_SOL)
                })
            )
            console.log(`Sent ${(solAmount * 1.015 + 0.0025).toFixed(3)} SOL to Wallet ${i + 1} (${consoleLogKeypairPubkey.slice(0, 8)})`);
        } catch (error) {
            console.log(`Error with wallet ${consoleLogKeypairPubkey.toBase58().slice(0, 8)}`);
        }
    }

    ixs.push(
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: getRandomTipAccount(),
            lamports: jitoTipAmt * LAMPORTS_PER_SOL
        })
    )
    console.log(ixs)
    return ixs;
}


// Send to all wallets function
//sendToAllWallets();