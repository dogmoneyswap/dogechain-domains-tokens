const fs = require('fs');
const BN = require('bignumber.js');

const data = fs.readFileSync('dnsholders.json');

const holders = JSON.parse(data);

for (const [addr, bal] of Object.entries(holders)) {
    // console.log(`npx hardhat --network dogechain erc20:transfer --recipient "${addr}" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "${(new BN(bal)).multipliedBy(1e18).toFixed()}"`)
    console.log(`erc20,0xe729ffC468e309F8d68bE26026C7A442D84caf2D,${addr},${bal.toFixed()},`)
}
