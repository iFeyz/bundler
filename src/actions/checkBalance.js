"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const web3_js_1 = require("@solana/web3.js");
const fs = __importStar(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
function checkBalance() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = new web3_js_1.Connection("https://api.mainnet-beta.solana.com", 'confirmed');
        //Lire les wallets dans le dossier wallets
        const getWallets = () => {
            if (!fs.existsSync('./wallets')) {
                console.log('Le dossier wallets n\'existe pas veuillez créer des wallets');
                return [];
            }
            return fs.readdirSync('./wallets')
                .filter((file) => file.endsWith('.json'))
                .map((file) => {
                const data = JSON.parse(fs.readFileSync(`./wallets/${file}`, 'utf8'));
                return {
                    publicKey: data.publicKey,
                    fileName: file
                };
            });
        };
        const checkWalletBalance = (publicKeyStr) => __awaiter(this, void 0, void 0, function* () {
            try {
                const publicKey = new web3_js_1.PublicKey(publicKeyStr);
                const balance = yield connection.getBalance(publicKey);
                return balance / web3_js_1.LAMPORTS_PER_SOL;
            }
            catch (error) {
                console.error(`Erreur lors de la vérification de la balance de la wallet ${publicKeyStr}:`, error);
                return 0;
            }
        });
        const checkMainWalletBalance = () => __awaiter(this, void 0, void 0, function* () {
            const mainWallet = process.env.MAIN_WALLET_PUBLIC_KEY;
            if (!mainWallet) {
                console.log('La clé publique du main wallet n\'est pas définie dans le fichier .env');
                return;
            }
            const balance = yield checkWalletBalance(mainWallet);
            console.log(`Solde du main wallet: ${balance} SOL`);
        });
        function displayWalletBalances() {
            return __awaiter(this, void 0, void 0, function* () {
                const wallets = getWallets();
                if (wallets.length === 0) {
                    console.log('Aucune wallet trouvée');
                    return;
                }
                console.log("\n Récupération des balances des wallets...");
                const balances = yield Promise.all(wallets.map((wallet) => __awaiter(this, void 0, void 0, function* () {
                    const balance = yield checkWalletBalance(wallet.publicKey);
                    return Object.assign(Object.assign({}, wallet), { balance });
                })));
                console.clear();
                console.log('Soldes des wallets:');
                console.log('------------------');
                balances.forEach(({ publicKey, balance, fileName }) => {
                    console.log(`\nWallet: ${fileName}`);
                    console.log(`Public Key: ${publicKey}`);
                    console.log(`Solde: ${balance} SOL`);
                });
            });
        }
        function mainMenu() {
            return __awaiter(this, void 0, void 0, function* () {
                while (true) {
                    const { choice } = yield inquirer_1.default.prompt([{
                            type: 'list',
                            name: 'choice',
                            message: 'Que voulez vous faire ?',
                            choices: ['Vérifier les soldes des wallets', "Vérifier solde du main wallet", 'Quitter']
                        }]);
                    switch (choice) {
                        case 'Vérifier les soldes':
                            yield displayWalletBalances();
                            break;
                        case 'Vérifier solde du main wallet':
                            yield checkMainWalletBalance();
                            break;
                        case 'Quitter':
                            return;
                    }
                }
            });
        }
        console.clear();
        console.log("Vérificateur de Soldes Solana");
        console.log("-----------------------------\n");
        yield mainMenu();
    });
}
exports.default = checkBalance;
