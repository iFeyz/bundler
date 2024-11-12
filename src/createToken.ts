import inquirer from 'inquirer';
import fs, { openAsBlob } from 'fs';
import axios from 'axios';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import { BN, Program} from "@coral-xyz/anchor"
import * as anchor from "@coral-xyz/anchor"
import { connection, PUMP_PROGRAM, rpc, wallet } from '../config';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { loadKeypairs } from './utils/utils';
import { MPL_TOKEN_METADATA_PROGRAM_ID, mintAuthority , eventAuthority } from '../config';
import { getRandomTipAccount } from './clients/config';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import { TransactionInstruction } from '@solana/web3.js';
import { SYSVAR_RENT_PUBKEY  } from '@solana/web3.js';
import { TransactionMessage } from '@solana/web3.js';
import { protobufPackage } from '../jito-ts/src/gen/geyser/confirmed_block';
import { global, feeRecipient } from '../config';
import  sendBundle  from './actions/sendBundle';

export default async function createToken() {
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(rpc), 
        new anchor.Wallet(wallet), 
        { commitment: "confirmed" }
    );
    // Pump fun anchor IDL
    const IDL_PumpFun = JSON.parse(fs.readFileSync("./pumpfun-IDL.json", "utf-8")) as anchor.Idl;
    const program = new anchor.Program(IDL_PumpFun, PUMP_PROGRAM, provider);
    
    // Create bundle
    const bundledTxns: VersionedTransaction[] = [];
    const keypairs : Keypair[] = loadKeypairs();


    let keyInfo : { [key : string] : any } = {};
    // Load keyInfo from wallets
    for(let i = 0; i < keypairs.length; i++){
        const existingKeyInfo = fs.readFileSync(`./wallets/wallet-${keypairs[i].publicKey.toString().slice(0, 8)}.json`);
        keyInfo[`kp${i}`] = JSON.parse(existingKeyInfo.toString());
    }

    // Load the address LUT

    const {name} = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Nom du token',
    }]);
    console.log(name);
    const {symbol} = await inquirer.prompt([{
        type: 'input',
        name: 'symbol',
        message: 'Symbole du token',
    }]);
    console.log(symbol);
    const {description} = await inquirer.prompt([{
        type: 'input',
        name: 'description',
        message: 'Description du token',
    }]);
    console.log(description);
    const {twitter} = await inquirer.prompt([{
        type: 'input',
        name: 'twitter',
        message: 'Twitter du token',
    }]);
    console.log(twitter);
    const {telegram} = await inquirer.prompt([{
        type: 'input',
        name: 'telegram',
        message: 'Telegram du token',
    }]);
    console.log(telegram);
    const {website} = await inquirer.prompt([{
        type: 'input',
        name: 'website',
        message: 'Website du token',
    }]);
    console.log(website);
    const {tipAmount} = await inquirer.prompt([{
        type: 'input',
        name: 'tipAmount',
        message: 'Montant du tip',
    }]);
    console.log(tipAmount);

    const files = await fs.promises.readdir('./img');
    if (files.length === 0) {
        console.log('No files found in ./img');
        return;
    }
    if(files.length > 1){
        console.log('More than one file found in ./img');
        return;
    }
    const data : Buffer = fs.readFileSync(`./img/${files[0]}`);

    const formData = new FormData();
    if(data){
        const blob = new Blob([data], { type: 'image/jpeg' }); 
        formData.append('file', blob, files[0]);
    } else {
        console.log('No data found');
        return;
    }

    formData.append('name', "PPTest"); //name
    formData.append('symbol', "TEST"); //symbol
    formData.append('description', 'his is an example token created via PumpPortal.fun'); //description
    formData.append('twitter', "https://x.com/a1lon9/status/1812970586420994083"); //twitter
    formData.append('telegram', "https://x.com/a1lon9/status/1812970586420994083"); //telegram
    formData.append('website', "https://pumpportal.fun"); //website
    formData.append('showName', 'true'); //showName

	let metadata_uri;
	try {
        let metadata_uri;
        let request = await fetch("https://pump.fun/api/ipfs", {
            method: "POST",
            headers: {
              "Host": "www.pump.fun",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
              "Accept": "*/*",
              "Accept-Language": "en-US,en;q=0.5",
              "Accept-Encoding": "gzip, deflate, br, zstd",
              "Referer": "https://www.pump.fun/create",
              "Origin": "https://www.pump.fun",
              "Connection": "keep-alive",
              "Sec-Fetch-Dest": "empty",
              "Sec-Fetch-Mode": "cors",
              "Sec-Fetch-Site": "same-origin",
              "Priority": "u=1",
              "TE": "trailers"
            },
            body: formData,
          });
          metadata_uri = await request.json();
    } catch (error) {
        console.error("Error uploading metadata:", error);
    }
    
    console.log(metadata_uri);
    metadata_uri = JSON.stringify({"name":"Bolt token","symbol":"Bolt2","description":"Brave Veer & Bolt","showName":true,"createdOn":"https://pump.fun"});



   

    const dataPool = fs.readFileSync(`./pool/info.json`);
    const pool = JSON.parse(dataPool.toString());
    const mintKp = Keypair.fromSecretKey(Uint8Array.from(bs58.decode(pool.mintPk)));
    console.log(`Mint keypair: ${mintKp.publicKey.toBase58()}`);
    const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-curve"), mintKp.publicKey.toBytes()], 
        program.programId
    )
    const [metadata] = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), MPL_TOKEN_METADATA_PROGRAM_ID.toBytes(), mintKp.publicKey.toBytes()], 
        MPL_TOKEN_METADATA_PROGRAM_ID
    )
    const associatedBondingCurve = spl.getAssociatedTokenAddressSync(mintKp.publicKey, bondingCurve , true);
    console.log(associatedBondingCurve);
    console.log(bondingCurve);

    const account1 = mintKp.publicKey;
    const account2 = mintAuthority;
    const account3 = bondingCurve;
    const account4 = global;
    const account5 = MPL_TOKEN_METADATA_PROGRAM_ID;
    const account6 = metadata;
    const account7 = feeRecipient;
    const assAccount = associatedBondingCurve;

    const createIx = await program.methods
        .create(name , symbol, metadata_uri)
        .accounts({
            mint : account1,
            mintAuthority : account2,
            bondingCurve : account3,
            associatedBondingCurve: assAccount,
            global : account4,
            mplTokenMetadata : account5,
            metadata : account6,
            user : wallet.publicKey,
            systemProgram : SystemProgram.programId,
            tokenProgram : spl.TOKEN_PROGRAM_ID,
            associatedTokenProgram : spl.ASSOCIATED_TOKEN_PROGRAM_ID,
            rent : SYSVAR_RENT_PUBKEY,
            eventAuthority,
            program : PUMP_PROGRAM
        })
    .instruction();
    //*

    const ata = spl.getAssociatedTokenAddressSync(mintKp.publicKey, wallet.publicKey);
    const ataIx = spl.createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, ata,wallet.publicKey, mintKp.publicKey,);


    // Excratct token info from  main wallet
    const mainWalletInfo = fs.readFileSync(`./wallet-main/wallet-main.json`);
    const mainWallet = JSON.parse(mainWalletInfo.toString());
    if(!mainWalletInfo){
        console.log('No keypair info found');
        return;
    }
    //const amount =  new BN(mainWallet.tokenAmount, 16);
    const amount = new BN(mainWallet.tokenAmount);
	const solAmount = new BN(mainWallet.solAmount * LAMPORTS_PER_SOL);

    const buyIx = await program.methods
        .buy(amount , solAmount)
        .accounts({
            systemProgram : SystemProgram.programId,
            tokenProgram : spl.TOKEN_PROGRAM_ID,
            rent : SYSVAR_RENT_PUBKEY,
            global : account4,
            feeRecipient : account7,
            eventAuthority,
            mint : account1,
            program : PUMP_PROGRAM,
            bondingCurve : account3,
            associatedBondingCurve : assAccount,
            associatedUser: wallet.publicKey,
        })
        .instruction();

    const tipIxn = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: getRandomTipAccount(),
        lamports: BigInt(0.01*LAMPORTS_PER_SOL),
    })

    const initIxs  : TransactionInstruction[] = [createIx, ataIx , buyIx , tipIxn]; // buyIx is not needed

    const {blockhash } = await connection.getLatestBlockhash();

    const messageV0 =  new TransactionMessage({
        payerKey : wallet.publicKey,
        instructions : initIxs,
        recentBlockhash : blockhash,
    }).compileToV0Message();

    const fullTX = new VersionedTransaction(messageV0);
    fullTX.sign([wallet , mintKp]);

    bundledTxns.push(fullTX);

   // console.log(buyIx);
    // TODO : test first buy 

    sendBundle(bundledTxns);
    
   

}

async function testKeyInfo() {
    const keypairs = loadKeypairs();
    let keyInfo: { [key: string]: any } = {};
    
    for(let i = 0; i < keypairs.length; i++) {
        const existingKeyInfo = fs.readFileSync(`./wallets/wallet-${keypairs[i].publicKey.toString().slice(0, 8)}.json`);
        keyInfo[`kp${i}`] = JSON.parse(existingKeyInfo.toString());

    }
    
    console.log( keyInfo);
}

// Add this line at the bottom of the file to run the test
// createToken();
createToken()




