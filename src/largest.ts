import {
    PublicKey,
    Connection,
    ParsedAccountData,
    clusterApiUrl
} from "@solana/web3.js";

import minimist from "minimist";
import bs58 from 'bs58';

const url = clusterApiUrl("mainnet-beta");
const walletMap = new Map();
const conn = new Connection(url, 'confirmed');

const METADATA_PROGRAM_ID =
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';

let args = minimist(process.argv.slice(2), {
    alias: {
        m: 'mintWallet',
        n: 'name',
        f: 'file'
    }
});

interface nftOwnerAccount {
    owner: string;
    token: string,
    tokenAccount: string
}

export async function fetchNFTOwner(pubkey: PublicKey): Promise<nftOwnerAccount> {
    const conn = new Connection(url, 'confirmed');

    try {
        const tokenAccount = (await conn.getTokenLargestAccounts(pubkey)).value[0];
        const tokenAccountInfo = ((await conn.getParsedAccountInfo(tokenAccount.address)).value?.data as any).parsed.info;
        return {
            owner: tokenAccountInfo.owner,
            token: tokenAccount.address.toString(),
            tokenAccount: tokenAccountInfo.mint
        }
    } catch (error) {
        console.log(error);
    }
}

function getFilters(){
    const filters = [];
    if ("mintWallet" in args) {
        filters.push({
            memcmp: {
                offset: 326,
                bytes: args.mintWallet,
            }
        })

    } else if ("name" in args) {
        const nameBytes = bs58.encode(Buffer.from(args.name));
        filters.push({
            memcmp: {
                offset: 69,
                bytes: nameBytes,
            }
        })
        //filename = args.n.replace(/\s/g, '');
    } else {
        console.error('please provide `mint wallet address` with -m or `mint name` with -n as an argument');
        return;
    }
    return filters;
}

(async function () {

    const accounts = await conn.getProgramAccounts(new PublicKey(METADATA_PROGRAM_ID), {
        filters: getFilters()
    });

});



