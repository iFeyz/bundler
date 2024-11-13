import { LAMPORTS_PER_SOL, PublicKey, VersionedTransaction, TransactionInstruction, AddressLookupTableProgram, SystemProgram, Keypair, TransactionMessage } from "@solana/web3.js";
//import {  connection } from "../../config";
import { getRandomTipAccount } from "../clients/config";
import lookupTableProvider from "../clients/LookupTableProvider";
import { Connection } from "@solana/web3.js";
import fs from 'fs';
import sendBundle from "./sendBundle";
import { payer } from "../../config";
export  async function createLUT() {
    let poolInfo : string;
    const jitoTipAmt = 0.001 * LAMPORTS_PER_SOL;
    const bundledTxns : VersionedTransaction[] = [];


    // Create the LUT
    const createLUTixs : TransactionInstruction[] = [];
    //change this
    const connection = new Connection("https://api.mainnet-beta.solana.com");

    const [ create , lut] = AddressLookupTableProgram.createLookupTable({
        authority: payer.publicKey,
        payer: payer.publicKey,
        recentSlot: await connection.getSlot("finalized"),
    });

    createLUTixs.push(
        create,
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: getRandomTipAccount(),
            lamports: jitoTipAmt,
        }),
    );

    const addressesMain : PublicKey[] = [];
    createLUTixs.forEach((ixn)=>{
        ixn.keys.forEach((key)=>{
            addressesMain.push(key.pubkey);
        });
    });

    const lookupTablesMain1 = lookupTableProvider.computeIdealLookupTablesForAddresses(addressesMain);
    const { blockhash } = await connection.getLatestBlockhash();

    const messageMain1 = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions: createLUTixs,
    }).compileToV0Message(lookupTablesMain1);
    const createLUT = new VersionedTransaction(messageMain1);
    poolInfo = lut.toString();

    try {
        const serializedMsg = createLUT.serialize();
        console.log('Txn size:', serializedMsg.length);
        if (serializedMsg.length > 1232) {
            console.log('tx too big');
        }
        createLUT.sign([payer]);
    } catch (e) {
        console.log(e, 'error signing createLUT');
        process.exit(0);
    }

    fs.writeFileSync('./pool/info.json', JSON.stringify({
        poolInfo: poolInfo,
    }));

    bundledTxns.push(createLUT);
    console.log(JSON.stringify(bundledTxns));

    await sendBundle(bundledTxns);



}

