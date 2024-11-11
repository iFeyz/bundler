import { Keypair } from "@solana/web3.js";
import fs from 'fs';
import path from 'path';

export const loadKeypairs = () : Keypair[] => {
    const walletPath = path.join(process.cwd(), 'wallets');

    try {
        //Check if directory exists
        if (!fs.existsSync(walletPath)){
            throw new Error('Le dossier wallets n\'existe pas');
            return [];
        }
        //read all files in the directory
        const files = fs.readdirSync(walletPath).filter((file) => file.endsWith('.json'));
        //Load keypairs from the JSON files
        return files.map(file=>{
            const filePath = path.join(walletPath, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const secretKey = Uint8Array.from(content.privateKey);
            return Keypair.fromSecretKey(secretKey);
        });
    } catch (error) {
        console.error('Erreur lors de la lecture des keypairs:', error);
        return [];
    }
}

export async function saveToFile(filePath : string, data : string){
    let existingData = {};
    try {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        existingData = JSON.parse(fileContent);
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error);
    }

    const newData = JSON.parse(data);
    const mergedData = {
        ...existingData,
        ...newData
    };
    fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
}

console.log(loadKeypairs().length);
console.log(loadKeypairs());