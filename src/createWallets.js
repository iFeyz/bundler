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
function createWallets() {
    return __awaiter(this, void 0, void 0, function* () {
        // Fonction pour créer un wallet
        const createSingleWallet = () => {
            const wallet = web3_js_1.Keypair.generate();
            const walletData = {
                publicKey: wallet.publicKey.toString(),
                privateKey: Array.from(wallet.secretKey)
            };
            if (!fs.existsSync('./wallets')) {
                fs.mkdirSync('./wallets');
            }
            fs.writeFileSync(`./wallets/wallet-${walletData.publicKey.slice(0, 8)}.json`, JSON.stringify(walletData, null, 2));
            console.log(`Wallet créé avec succès! Clé publique: ${walletData.publicKey}`);
        };
        function mainMenu() {
            return __awaiter(this, void 0, void 0, function* () {
                while (true) {
                    const { choice } = yield inquirer_1.default.prompt([
                        {
                            type: 'list',
                            name: 'choice',
                            message: 'Que voulez-vous faire?',
                            choices: [
                                'Créer un nouveau wallet',
                                'Créer plusieurs wallets',
                                'Quitter'
                            ]
                        }
                    ]);
                    switch (choice) {
                        case 'Créer un nouveau wallet':
                            createSingleWallet();
                            yield inquirer_1.default.prompt([
                                {
                                    type: 'input',
                                    name: 'continue',
                                    message: 'Appuyez sur Enter pour continuer...'
                                }
                            ]);
                            break;
                        case 'Créer plusieurs wallets':
                            const { amount } = yield inquirer_1.default.prompt([
                                {
                                    type: 'number',
                                    name: 'amount',
                                    message: 'Combien de wallets voulez-vous créer?',
                                    validate: (value) => {
                                        if (value && value > 0)
                                            return true;
                                        return 'Veuillez entrer un nombre positif';
                                    }
                                }
                            ]);
                            for (let i = 0; i < amount; i++) {
                                createSingleWallet();
                            }
                            console.log(`\n${amount} wallets ont été créés avec succès!`);
                            yield inquirer_1.default.prompt([
                                {
                                    type: 'input',
                                    name: 'continue',
                                    message: 'Appuyez sur Enter pour continuer...'
                                }
                            ]);
                            break;
                        case 'Quitter':
                            console.log('Au revoir!');
                            return;
                    }
                }
            });
        }
        console.clear();
        console.log("Générateur de Wallets Solana");
        console.log("---------------------------\n");
        yield mainMenu();
    });
}
exports.default = createWallets;
