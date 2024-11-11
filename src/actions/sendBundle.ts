import { VersionedTransaction } from "@solana/web3.js";

import { searcherClient } from "../clients/jito";
import { Bundle as JitoBundle } from "../../jito-ts/src/sdk/block-engine/types";
import { SearcherClient } from "../../jito-ts/src/sdk/block-engine/searcher";
async function sendBundle(bundledTxns: VersionedTransaction[]) {
    const onBundleResult = (c: SearcherClient) => {
        c.onBundleResult(
          result => {
            console.log('received bundle result:', result);
          },
          e => {
            throw e;
          }
        );
    };
    try {
        const bundleId = await searcherClient.sendBundle(new JitoBundle(bundledTxns, bundledTxns.length));
        console.log(`Bundle ${bundleId} sent.`);
        onBundleResult(searcherClient);
    } catch (error) {
        const err = error as any;
        console.error("Error sending bundle:", err.message);
    
        if (err?.message?.includes('Bundle Dropped, no connected leader up soon')) {
            console.error("Error sending bundle: Bundle Dropped, no connected leader up soon.");
        } else {
            console.error("An unexpected error occurred:", err.message);
        }
    }

}

export default sendBundle;