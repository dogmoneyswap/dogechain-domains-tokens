const fs = require('fs');
const BN = require('bignumber.js');

const data = fs.readFileSync('dnsholders.json');

const holders = JSON.parse(data);

console.log('#!/bin/bash');
console.log('set -x');
console.log();

for (const [addr, bal] of Object.entries(holders)) {
    console.log(`npx hardhat --network dogechain erc20:transfer --recipient "${addr}" --token "0xE6bBD3B28C14bf325b91203De60aF2458DBFc5b6" --amount "${(new BN(bal)).multipliedBy(1e18).toFixed()}"`)
    // console.log(`erc20,0xE6bBD3B28C14bf325b91203De60aF2458DBFc5b6,${addr},${bal.toFixed()},`)
}
