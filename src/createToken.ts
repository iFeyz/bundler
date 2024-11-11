import inquirer from 'inquirer';
import fs from 'fs';
import axios from 'axios';
import { PublicKey } from '@solana/web3.js';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import { Program} from "@coral-xyz/anchor"
import * as anchor from "@coral-xyz/anchor"
import { PUMP_PROGRAM, rpc, wallet } from '../config';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { loadKeypairs } from './utils/utils';

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

    let formData = new FormData();
    if(data){
        formData.append('file', await fs.openAsBlob(`./img/${files[0]}`));
    } else {
        console.log('No data found');
        return;
    }
    formData.append('name', name);
    formData.append('symbol', symbol);
    formData.append('description', description);
    formData.append('twitter', twitter);
    formData.append('telegram', telegram);
    formData.append('website', website);
    formData.append('showName', 'true');

    let medatadata_uri

    try {
        const response = await fetch('https://pump.fun/api/ipfs', {
            method: 'POST',
            body: formData,
        });
        const responseData = await response.json();
        const metadata_uri = responseData.metadataUri;
        console.log(metadata_uri);
    } catch (error) {
        console.error('Error uploading metadata to IPFS:', error);
    }

   /* const mintKp = Keypair.generate();
    fs.writeFileSync(`./mint-wallet/mint-wallet.json`, JSON.stringify(mintKp, null, 2));
    console.log(`Mint keypair: ${mintKp.publicKey.toString()}`);
    const [bondingCurve] =  */


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
testKeyInfo();




