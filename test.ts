import { MPL_TOKEN_METADATA_PROGRAM_ID, rpc, wallet } from "./config";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { PUMP_PROGRAM } from "./config";
import fs from "fs";
import { connection } from "./config";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const provider = new anchor.AnchorProvider(
    new anchor.web3.Connection(rpc), 
    new anchor.Wallet(wallet), 
    { commitment: "confirmed" }
);
const IDL_PumpFun = JSON.parse(fs.readFileSync("./pumpfun-IDL.json", "utf-8")) as anchor.Idl;
const program = new anchor.Program(IDL_PumpFun, PUMP_PROGRAM, provider);

const mintKp = new PublicKey("WCbWzF6R34A23Bt9jhxmN1Yffbkg7uAxab1f7rGpump");
const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mintKp.toBytes()], 
    program.programId
)

const boundingCurvePDA = (mint : PublicKey) => {    
    return PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-curve"), mint.toBuffer()],
        program.programId
      )[0];
}

async function associatedBondingCurve(){
    return await getAssociatedTokenAddress(
        mintKp,
        bondingCurve,
        true
    )
}

//asociated bounding curve solve
async function main(){
    const a = await associatedBondingCurve()
    console.log(a.toBase58());
}
main()

 // 08b463d81061