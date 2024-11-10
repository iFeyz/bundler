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
const inquirer_1 = __importDefault(require("inquirer"));
const createWallets_1 = __importDefault(require("./src/createWallets"));
const checkBalance_1 = __importDefault(require("./src/actions/checkBalance"));
const displayMainMenu = () => __awaiter(void 0, void 0, void 0, function* () {
    while (true) {
        const choices = [
            "Create new token",
            "Create new wallets",
            "Manage wallets",
            "Import wallets",
            "Exit"
        ];
        const { selectedOption } = yield inquirer_1.default.prompt([{
                type: "list",
                name: "selectedOption",
                message: "Veuillez choisir une option:",
                choices: choices
            }]);
        switch (selectedOption) {
            case choices[0]:
                yield displayCreateTokenMenu();
                break;
            case choices[1]:
                yield displayCreateWalletMenu();
                break;
            case choices[2]:
                yield displayManageWalletsMenu();
                break;
            case choices[3]:
                yield displayImportWalletsMenu();
                break;
            case choices[4]:
                console.log("See you soon!");
                process.exit(0);
        }
    }
});
const displayCreateTokenMenu = () => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement the create new token menu
    while (true) {
        const choices = [
            "Create new token",
            "Back to main menu"
        ];
        const { selectedOption } = yield inquirer_1.default.prompt([{
                type: "list",
                name: "selectedOption",
                message: "Veuillez choisir une option:",
                choices: choices
            }]);
        switch (selectedOption) {
            case choices[0]:
                console.log("Menu create new token");
                break;
            case choices[1]:
                return;
        }
    }
});
const displayCreateWalletMenu = () => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement the create new wallet menu
    yield (0, createWallets_1.default)();
});
const displayManageWalletsMenu = () => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement the manage wallets menu
    yield (0, checkBalance_1.default)();
});
const displayImportWalletsMenu = () => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement the import wallets menu
    console.log("Import wallets");
});
displayMainMenu();
