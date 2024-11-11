import { TransactionMessage, VersionedTransaction, TransactionInstruction, Blockhash, AddressLookupTableAccount } from "@solana/web3.js";
import { payer } from "../../config";

async function buildTxn(extendLUTixs: TransactionInstruction[], blockhash: string | Blockhash, lut: AddressLookupTableAccount): Promise<VersionedTransaction> {
    const messageMain = new TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: blockhash,
            instructions: extendLUTixs,
        }).compileToV0Message([lut]);
        const txn = new VersionedTransaction(messageMain);
    
        try {
            const serializedMsg = txn.serialize();
            console.log('Txn size:', serializedMsg.length);
            if (serializedMsg.length > 1232) {
                console.log('tx too big');
            }
            txn.sign([payer]);
        } catch (e) {
            const serializedMsg = txn.serialize();
            console.log('txn size:', serializedMsg.length);
            console.log(e, 'error signing extendLUT');
            process.exit(0);
        }
        return txn;
}

export default buildTxn;