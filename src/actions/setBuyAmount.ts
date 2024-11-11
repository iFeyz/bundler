import { loadKeypairs, saveToFile } from '../utils/utils';
import { walletBuy } from '../types/types';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { join } from 'path';


async function setBuyAmount(solAmount: number){
    const keypairs = loadKeypairs();
    if (keypairs.length === 0){
        console.log('Aucune wallet trouvée crée des wallets');
        return;
    }




	const tokenDecimals = 10 ** 6;
	const tokenTotalSupply = 1000000000 * tokenDecimals;
	let initialRealSolReserves = 0;
	let initialVirtualTokenReserves = 1073000000 * tokenDecimals;
	let initialRealTokenReserves = 793100000 * tokenDecimals;
	let totalTokensBought = 0;

    const buys : walletBuy[] = [];

    const totalWallets = keypairs.length + 1;
    const percentages: number[] = [];
    let remainingPercentage = 100;

    for (let i = 0; i < totalWallets - 1; i++) {
        const minPercent = 5;
        const maxPercent = Math.min(30, remainingPercentage - (5 * (totalWallets - i - 1)));
        const percent = Math.floor(Math.random() * (maxPercent - minPercent + 1) + minPercent);
        percentages.push(percent);
        remainingPercentage -= percent;
    }
    percentages.push(remainingPercentage);

    const totalPercent = percentages.reduce((a, b) => a + b, 0);
    console.log('Pourcentages:', percentages, 'Total:', totalPercent + '%');

    for (let i = 0; i < totalWallets; i++){
        
        const walletSolAmount = solAmount * (percentages[i] / 100);
        const solAmountLamports = walletSolAmount * LAMPORTS_PER_SOL;
        //Bound curve calculation
		const e = new BN(solAmountLamports);
		const initialVirtualSolReserves = 30 * LAMPORTS_PER_SOL + initialRealSolReserves;
		const a = new BN(initialVirtualSolReserves).mul(new BN(initialVirtualTokenReserves));
		const z = new BN(initialVirtualSolReserves).add(e);
		const l = a.div(z).add(new BN(1));
		let tokensToBuy = new BN(initialVirtualTokenReserves).sub(l);
		tokensToBuy = BN.min(tokensToBuy, new BN(initialRealTokenReserves));

		const tokensBought = tokensToBuy.toNumber();
		const percentSupply = (tokensBought / tokenTotalSupply) * 100;

        buys.push({
            solAmount: walletSolAmount,
            tokenAmount: tokensToBuy,
            percent: percentages[i],
            percentSupply: percentSupply
        });
		initialRealSolReserves += e.toNumber();
		initialRealTokenReserves -= tokensBought;
		initialVirtualTokenReserves -= tokensBought;
		totalTokensBought += tokensBought;
        if(i == 0){
            try {       
                const walletPath = join(__dirname, '../../wallet-main', `wallet-main.json`);
                await saveToFile(walletPath, JSON.stringify(buys[i], null, 2));
            } catch (error) {
                console.error('Erreur lors de l\'enregistrement  du main-wallet :', error);
            }
        } else {
            try {
                const walletPath = join(__dirname, '../../wallets', `wallet-${keypairs[i-1].publicKey.toBase58().slice(0, 8)}.json`);
                await saveToFile(walletPath, JSON.stringify(buys[i], null, 2));
            } catch (error) {
                console.error('Erreur lors de l\'enregistrement des wallets:', error);
            }
        }
    }

    return buys;
}

export default setBuyAmount;