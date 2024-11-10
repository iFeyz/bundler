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
const utils_1 = require("../utils/utils");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
function setBuyAmount(solAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        const keypairs = (0, utils_1.loadKeypairs)();
        if (keypairs.length === 0) {
            console.log('Aucune wallet trouvée crée des wallets');
            return;
        }
        const tokenDecimals = 10 ** 6;
        const tokenTotalSupply = 1000000 * tokenDecimals;
        const buys = [];
        let remainingPercentage = 100;
        let remainingWallets = keypairs.length;
        const percentages = [];
        for (let i = 0; i < keypairs.length; i++) {
            const minPercent = Math.min(15, remainingPercentage - (15 * (remainingWallets - 1)));
            const maxPercent = remainingPercentage - (15 * (remainingWallets - 1));
            const randomPercent = Math.random() * (maxPercent - minPercent) + minPercent;
            percentages.push(randomPercent);
            remainingPercentage -= randomPercent;
            remainingWallets--;
        }
        for (let i = 0; i < keypairs.length; i++) {
            const walletSolAmount = solAmount * (percentages[i] / 100);
            const walletTokenAmount = new bn_js_1.default(Math.floor(walletSolAmount * tokenTotalSupply));
            buys.push({
                pubKey: keypairs[i].publicKey,
                amount: walletSolAmount * web3_js_1.LAMPORTS_PER_SOL,
                tokenAmount: walletTokenAmount,
                percent: percentages[i],
                percentSupply: (walletTokenAmount.toNumber() / tokenTotalSupply) * 100
            });
            try {
                yield (0, utils_1.saveToFile)(`../wallets/wallet-${keypairs[i].publicKey.toBase58()}.json`, JSON.stringify(buys[i], null, 2));
            }
            catch (error) {
                console.error('Erreur lors de l\'enregistrement des wallets:', error);
            }
        }
        return buys;
    });
}
setBuyAmount(100);
exports.default = setBuyAmount;
