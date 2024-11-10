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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainWalletPublicKey = getMainWalletPublicKey;
const dotenv = __importStar(require("dotenv"));
const web3_js_1 = require("@solana/web3.js");
dotenv.config();
function getMainWalletPublicKey() {
    const publicKeyStr = process.env.MAIN_WALLET_PUBLIC_KEY;
    if (!publicKeyStr) {
        throw new Error('MAIN_WALLET_PUBLIC_KEY n\'est pas défini dans le fichier .env');
    }
    try {
        return new web3_js_1.PublicKey(publicKeyStr);
    }
    catch (error) {
        throw new Error('MAIN_WALLET_PUBLIC_KEY dans le .env n\'est pas une clé publique Solana valide');
    }
}