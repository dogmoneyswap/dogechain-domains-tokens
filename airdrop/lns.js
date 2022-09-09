const fs = require('fs');
const BN = require('bignumber.js');
BN.set({ ROUNDING_MODE: BN.ROUND_DOWN })


const AIRDROP_AMOUNT = (new BN("5000")).multipliedBy(1e18); // total remaining would be 25000

const LNS_MULTIPLIER = new BN(1.0736);

const lnsdata = fs.readFileSync('lnsholders.json');
const lnsparsed = JSON.parse(lnsdata);
const lnsholders = Object.fromEntries(lnsparsed.result
    .filter((v) => {
        const skip = [
            '0xBE7E034c86AC2a302f69ef3975e3D14820cC7660', // domainbar
            '0x5eB85d9D7dc2F2C70F4C13b4Ba9Ed21d65141037', // sablier
            '0x7f3F57C92681c9a132660c468f9cdff456fC3Fd7', // mistswap lp
        ].map((v) => v.toLowerCase());
        return ! skip.includes(v.address)
    })
    .map((v) => ([v.address, new BN(v.value).multipliedBy(LNS_MULTIPLIER).integerValue()]))
    .filter((v) => {
        return v[1].isGreaterThan(1e18);
    })
)


const xlnsdata = fs.readFileSync('xlnsholders.json');
const xlnsparsed = JSON.parse(xlnsdata);
const xlnsholders = Object.fromEntries(xlnsparsed.result
    .filter((v) => {
        const skip = [
            '0x5adBCC69084B85791E4cE030419F65D6D7f4a578', // mistbarconverter
            '0x07D4115bCDb2b709ff07d0dA11f5Da7D85C5b769', // mistswap.bch
            '0x8370DAE31693A8BbB9630b7052de52aCBcEC7525', // kasumi.bch
            '0x3F539aFb04a6C3b3CdfDB08889d63FD14987F251', // pat
        ].map((v) => v.toLowerCase());
        return ! skip.includes(v.address)
    })
    .map((v) => ([v.address, new BN(v.value)]))
    .filter((v) => {
        return v[1].isGreaterThan(1e18);
    })
)


// merge lns & xlns into holders
const holders = lnsholders;
for (const [addr, bal] of Object.entries(xlnsholders)) {
    if (typeof holders[addr] === 'undefined') {
        holders[addr] = bal;
    } else {
        holders[addr] = holders[addr].plus(bal);
    }
}

// console.log(holders)

console.log('#!/bin/bash');
console.log('set -x');
console.log();

const totalBalance = Object.entries(holders).reduce((a, v) => a.plus(v[1]), new BN(0));
for (const [addr, bal] of Object.entries(holders)) {
    const amnt = bal.dividedBy(totalBalance).multipliedBy(AIRDROP_AMOUNT);
    holders[addr] = amnt;
    // console.log(`erc20,0xE6bBD3B28C14bf325b91203De60aF2458DBFc5b6,${addr},${amnt},`)
    // console.log(addr, holders[addr].toFixed())
    console.log(`npx hardhat --network dogechain erc20:transfer --recipient "${addr}" --token "0xE6bBD3B28C14bf325b91203De60aF2458DBFc5b6" --amount "${amnt.toFixed()}"`)
}
// const totalToSend = Object.entries(holders).reduce((a, v) => a.plus(v[1]), new BN(0));
// console.log(totalToSend.dividedBy(1e18).toString())

// console.log(holders);
