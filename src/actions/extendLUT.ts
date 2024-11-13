import { PublicKey, Keypair, SYSVAR_RENT_PUBKEY, SystemProgram , TransactionInstruction , AddressLookupTableProgram, LAMPORTS_PER_SOL, VersionedTransaction} from "@solana/web3.js";
import fs from 'fs';
import { connection, wallet } from "../../config";
import bs58 from 'bs58';
import { Program, Idl, AnchorProvider, setProvider  } from '@coral-xyz/anchor';
import { PUMP_PROGRAM } from '../../config';
import * as spl from "@solana/spl-token";
import idl from "../../pumpfun-IDL.json";
import { loadKeypairs } from "../utils/utils";
import { payer } from "../../config";
import { getRandomTipAccount } from "../clients/config";
import path from 'path';
import buildTxn from "./buildTxn";
import promptSync from 'prompt-sync';
import sendBundle from "./sendBundle";


export const extendLUT = async () => {
    //All new  key to push in the new LUT
    const bundledTxns1: VersionedTransaction[] = [];
    const accounts: PublicKey[] = [];
    const lut = new PublicKey(JSON.parse(fs.readFileSync('./pool/info.json', 'utf8') ).poolInfo);

    const lookupTableAccount = (
        await connection.getAddressLookupTable(lut)
    ).value;

    if (lookupTableAccount == null) {
        console.log("Lookup table account not found!");
        process.exit(0);
    }

    const mintKp = Keypair.generate();
    console.log(`Mint : ${mintKp.publicKey.toString()}`);
    const mint = mintKp.publicKey.toString();
    const mintPk = bs58.encode(mintKp.secretKey);
    const existingData = JSON.parse(fs.readFileSync('./pool/info.json', 'utf8'));
    const updatedData = {
        ...existingData,
        mint,
        mintPk
    };
    const provider = new AnchorProvider(connection, wallet as any, {});
    setProvider(provider);
    const program = new Program(idl as Idl, PUMP_PROGRAM);

    fs.writeFileSync('./pool/info.json', JSON.stringify(updatedData, null, 2));

    //FETCH pumpfun accounts for LUT
    const mintAuthority = new PublicKey(
        "TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM"
    );
    const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const global = new PublicKey(
        "4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"
    );
    const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from("bounding-curve"), mintKp.publicKey.toBytes()],program.programId
    );
    const [metadata] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            MPL_TOKEN_METADATA_PROGRAM_ID.toBytes(),
            mintKp.publicKey.toBytes()
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID
    );
    let [associatedBondingCurve] = PublicKey.findProgramAddressSync(
        [
            bondingCurve.toBytes(),
            spl.TOKEN_PROGRAM_ID.toBytes(),
            mintKp.publicKey.toBytes(),
        ],
        spl.ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const eventAuthority = new PublicKey(
        "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"
    );
    const feeRecipient = new PublicKey(
        "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"
    );

    accounts.push(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        MPL_TOKEN_METADATA_PROGRAM_ID,
        mintAuthority,
        global,
        program.programId,
        PUMP_PROGRAM,
        metadata,
        associatedBondingCurve,
        bondingCurve,
        eventAuthority,
        SystemProgram.programId,
        SYSVAR_RENT_PUBKEY,
        mintKp.publicKey,
        feeRecipient,
    );
    const keypairs = loadKeypairs();
    for(const keypair of keypairs){
        const ataToken = await spl.getAssociatedTokenAddressSync(
            mintKp.publicKey,
            keypair.publicKey,
        );
        accounts.push(keypair.publicKey,ataToken);
    }
    const mainWallet = fs.readFileSync('./wallet-main/wallet-main.json', 'utf8');
    const mainWalletData = JSON.parse(mainWallet);
    const ataTokenMain = await spl.getAssociatedTokenAddressSync(
        mintKp.publicKey,
        new PublicKey(mainWalletData.publicKey),
    );
    const ataTokenPayer = await spl.getAssociatedTokenAddressSync(
        mintKp.publicKey,
        payer.publicKey,
    );

    accounts.push(
        new PublicKey(mainWalletData.publicKey),
        payer.publicKey,
        ataTokenMain,
        ataTokenPayer,
        lut,
        spl.NATIVE_MINT
    );

    // repart all lut addresses to a single tx

    const ADDRESSES_PER_CHUNCK = 20;
    const accountChunks = Array.from(
        { length : Math.ceil(accounts.length / ADDRESSES_PER_CHUNCK)},
        (_, i) => accounts.slice(i * ADDRESSES_PER_CHUNCK, (i + 1) * ADDRESSES_PER_CHUNCK)
        );

    console.log("Num of chunks : ", accountChunks.length);
    console.log("Num of accounts : ", accounts.length)

    const extendLUTixs: TransactionInstruction[][] = Array(accountChunks.length)
    .fill(null)
    .map(() => []);

    accountChunks.forEach((chunk, i) => {
        const extendInstruction = AddressLookupTableProgram.extendLookupTable({
            lookupTable: lut,
            authority: payer.publicKey,
            payer: payer.publicKey,
            addresses: chunk,
        });
        extendLUTixs[i].push(extendInstruction);
        console.log("Chunk:", i, "Size:", chunk.length);
    });

    extendLUTixs[extendLUTixs.length - 1].push(
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: getRandomTipAccount(),
            lamports: BigInt(0.00001 * LAMPORTS_PER_SOL), // jito tip add modifier TODO
        })
    );
    const { blockhash: block1 } = await connection.getLatestBlockhash();
    
    // Create and bundle transactions for each chunk
    const bundledTxns = await Promise.all(
        extendLUTixs.map(ixs => buildTxn(ixs, block1, lookupTableAccount))
    );

    bundledTxns1.push(...bundledTxns);  
    console.log("Bundled txns size : ", bundledTxns1);

    await sendBundle(bundledTxns1);
};

