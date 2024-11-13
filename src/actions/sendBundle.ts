import { VersionedTransaction } from "@solana/web3.js";
import { searcherClient } from "../clients/jito";
import { Bundle as JitoBundle } from "../../jito-ts/src/sdk/block-engine/types";
import { SearcherClient } from "../../jito-ts/src/sdk/block-engine/searcher";

function debugBundle(transactions: VersionedTransaction[]) {
    console.log('\x1b[36m=== Bundle Debug Information ===\x1b[0m');
    console.log(`Total transactions in bundle: ${transactions.length}`);
    
    transactions.forEach((tx, index) => {
        console.log(`\n\x1b[33mTransaction #${index + 1}:\x1b[0m`);
        console.log(`Message Version: ${tx.message.version}`);
        console.log(`Number of signatures: ${tx.signatures.length}`);
        console.log(`Number of instructions: ${tx.message.compiledInstructions.length}`);
        
        // Log each signature
        tx.signatures.forEach((sig, sigIndex) => {
            console.log(`Signature ${sigIndex + 1}: ${sig.toString()}`);
        });
        
        // Add detailed signature verification
        console.log('\nSignature Details:');
        tx.signatures.forEach((sig, sigIndex) => {
            const isValidLength = sig.length === 64;
            const isNonZero = !sig.every(byte => byte === 0);
            console.log(`Signature ${sigIndex + 1}:`);
            console.log(`  Length valid: ${isValidLength}`);
            console.log(`  Non-zero: ${isNonZero}`);
            console.log(`  Raw length: ${sig.length} bytes`);
        });
        
        // Add instruction details
        console.log('\nInstruction Details:');
        tx.message.compiledInstructions.forEach((inst, idx) => {
            console.log(`Instruction ${idx + 1}:`);
            console.log(`  Program ID Index: ${inst.programIdIndex}`);
            console.log(`  Account Indexes: ${inst.accountKeyIndexes.join(', ')}`);
        });
    });
    console.log('\x1b[36m=== End Debug Information ===\x1b[0m\n');
}

async function sendBundle(bundledTxns: VersionedTransaction[]) {
    // Debug chaque transaction avant l'envoi
    bundledTxns.forEach((tx, index) => {
        console.log(`\n=== Transaction ${index + 1} Debug ===`);
        try {
            // Vérifier la validité de base de la transaction
            console.log(`Signatures: ${tx.signatures.length}`);
            console.log(`Instructions: ${tx.message.compiledInstructions.length}`);
            
            // Afficher les comptes impliqués
            const accounts = tx.message.staticAccountKeys;
            console.log('Accounts involved:');
            accounts.forEach((account, i) => {
                console.log(`  ${i}: ${account.toBase58()}`);
            });

            // Vérifier si la transaction est signée correctement
            const isFullySigned = tx.signatures.every(sig => sig.length === 64);
            console.log(`Fully signed: ${isFullySigned}`);
            
        } catch (err) {
            console.error(`Error analyzing transaction ${index + 1}:`, err);
        }
        console.log('=== End Transaction Debug ===\n');
    });

    // Create a promise that resolves with the bundle result or rejects after timeout
    const waitForBundleResult = (client: SearcherClient, timeoutMs: number = 30000) => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Bundle result timeout'));
            }, timeoutMs);

            client.onBundleResult(
                result => {
                    clearTimeout(timeout);
                    resolve(result);
                },
                error => {
                    clearTimeout(timeout);
                    reject(error);
                }
            );
        });
    };

    try {
        const bundleId = await searcherClient.sendBundle(new JitoBundle(bundledTxns, bundledTxns.length));
        console.log(`Bundle ${bundleId} sent successfully.`);
        
        // Attendre le résultat du bundle
        try {
            const result = await waitForBundleResult(searcherClient);
            console.log('Bundle result:', result);
        } catch (resultError: any) {
            console.error('Bundle result error:', resultError.message);
        }
    } catch (error: any) {
        console.error("Bundle send error:", error.message);
        if (error?.message?.includes('Bundle Dropped')) {
            console.error("Bundle was dropped. Possible reasons:");
            console.error("- No connected leader");
            console.error("- Invalid transaction format");
            console.error("- Insufficient fees");
        }
        throw error;
    }
}

export default sendBundle;

