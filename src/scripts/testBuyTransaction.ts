import {
    Connection,
    Keypair,
    PublicKey,
    LAMPORTS_PER_SOL,
    VersionedTransaction,
    TransactionMessage,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import * as spl from "@solana/spl-token";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { eventAuthority, PUMP_PROGRAM } from "../../config";
import BN from "bn.js";
import { loadKeypairs } from "../utils/utils";
import { program } from "@coral-xyz/anchor/dist/cjs/native/system";
import { feeRecipient } from "../../config";

async function testBuyTransaction() {
    // Connexion à devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // Charger votre wallet test
    const testWallet = Keypair.generate(); // ou chargez un wallet existant
    
    // Airdrop de SOL pour les tests
    const airdropSignature = await connection.requestAirdrop(
        testWallet.publicKey,
        LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    
    // Paramètres de test
    const amount = new BN(1000000); // montant de tokens à acheter
    const solAmount = new BN(0.1 * LAMPORTS_PER_SOL); // montant de SOL à dépenser
    
    // Récupérer le dernier blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    
    // Créer l'instruction buy
    const buyIx = await program.methods
        .buy(amount, solAmount)
        .accounts({
            systemProgram: SystemProgram.programId,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            global: global,
            feeRecipient: feeRecipient,
            eventAuthority: eventAuthority,
            mint: mint,
            program: PUMP_PROGRAM,
            bondingCurve: bondingCurve,
            associatedBondingCurve: associatedBondingCurve,
            associatedUser: ataAddress,
            user: testWallet.publicKey,
        })
        .instruction();

    // Créer la transaction
    const messageV0 = new TransactionMessage({
        payerKey: testWallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [buyIx],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    
    // Signer la transaction
    transaction.sign([testWallet]);
    
    try {
        // Envoyer la transaction
        const signature = await connection.sendTransaction(transaction);
        console.log("Transaction envoyée avec succès !");
        console.log("Signature:", signature);
        
        // Attendre la confirmation
        const confirmation = await connection.confirmTransaction(signature);
        console.log("Transaction confirmée :", confirmation);
    } catch (error) {
        console.error("Erreur lors de l'envoi de la transaction :", error);
    }
}

testBuyTransaction().catch(console.error); 