"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadKeypairs = void 0;
exports.saveToFile = saveToFile;
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const loadKeypairs = () => {
    const walletPath = path_1.default.join(process.cwd(), 'wallets');
    try {
        //Check if directory exists
        if (!fs_1.default.existsSync(walletPath)) {
            throw new Error('Le dossier wallets n\'existe pas');
            return [];
        }
        //read all files in the directory
        const files = fs_1.default.readdirSync(walletPath).filter((file) => file.endsWith('.json'));
        //Load keypairs from the JSON files
        return files.map(file => {
            const filePath = path_1.default.join(walletPath, file);
            const content = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
            const secretKey = Uint8Array.from(content.privateKey);
            return web3_js_1.Keypair.fromSecretKey(secretKey);
        });
    }
    catch (error) {
        console.error('Erreur lors de la lecture des keypairs:', error);
        return [];
    }
};
exports.loadKeypairs = loadKeypairs;
function saveToFile(filePath, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let existingData = {};
        try {
            const fileContent = yield fs_1.default.promises.readFile(filePath, 'utf-8');
            existingData = JSON.parse(fileContent);
        }
        catch (error) {
            console.error('Erreur lors de la lecture du fichier:', error);
        }
        const newData = JSON.parse(data);
        const mergedData = Object.assign(Object.assign({}, existingData), newData);
        fs_1.default.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
    });
}
