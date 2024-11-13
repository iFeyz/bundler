import {
    AccountInfo,
    AddressLookupTableAccount,
    AddressLookupTableProgram,
    PublicKey,
  } from '@solana/web3.js'; 

  

class LookupTableProvider {
    lookupTables : Map<string, AddressLookupTableAccount>  | any;
    addressesForLookupTable : Map<string, Set<string>> | any;
    lookupTablesForAddress : Map<string, Set<string>> | any;

    constructor(){
        this.lookupTables = new Map();
        this.addressesForLookupTable = new Map();
        this.lookupTablesForAddress = new Map();
    }

    computeIdealLookupTablesForAddresses(
        addresses: PublicKey[],
      ): AddressLookupTableAccount[] {
        const MIN_ADDRESSES_TO_INCLUDE_TABLE = 2;
        const MAX_TABLE_COUNT = 3;
    
        const addressSet = new Set<string>();
        const tableIntersections = new Map<string, number>();
        const selectedTables: AddressLookupTableAccount[] = [];
        const remainingAddresses = new Set<string>();
        let numAddressesTakenCareOf = 0;
    
        for (const address of addresses) {
          const addressStr = address.toBase58();
    
          if (addressSet.has(addressStr)) continue;
          addressSet.add(addressStr);
    
          const tablesForAddress =
            this.lookupTablesForAddress.get(addressStr) || new Set();
    
          if (tablesForAddress.size === 0) continue;
    
          remainingAddresses.add(addressStr);
    
          for (const table of tablesForAddress) {
            const intersectionCount = tableIntersections.get(table) || 0;
            tableIntersections.set(table, intersectionCount + 1);
          }
        }
    
        const sortedIntersectionArray = Array.from(
          tableIntersections.entries(),
        ).sort((a, b) => b[1] - a[1]);
    
        for (const [lutKey, intersectionSize] of sortedIntersectionArray) {
          if (intersectionSize < MIN_ADDRESSES_TO_INCLUDE_TABLE) break;
          if (selectedTables.length >= MAX_TABLE_COUNT) break;
          if (remainingAddresses.size <= 1) break;
    
          const lutAddresses :any= this.addressesForLookupTable.get(lutKey);
    
          const addressMatches = new Set(
            [...remainingAddresses].filter((x) => lutAddresses.has(x)),
          );
    
          if (addressMatches.size >= MIN_ADDRESSES_TO_INCLUDE_TABLE) {
            selectedTables.push(this.lookupTables.get(lutKey));
            for (const address of addressMatches) {
              remainingAddresses.delete(address);
              numAddressesTakenCareOf++;
            }
          }
        }
    
        return selectedTables;
      }

}

const lookupTableProvider = new LookupTableProvider();

export default lookupTableProvider;