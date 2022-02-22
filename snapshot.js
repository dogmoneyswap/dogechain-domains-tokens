const ethers = require("ethers");
const { argv } = require("process");

// encoded topic corresponding to Transfer event
const sep20TransferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// smartbch rpc url
const rpcUrl = "https://smartbch.fountainhead.cash/mainnet";

// instantiate ethers provider
const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
  name: "smartbch",
  chainId: 10000,
});

// BigNumber zero
const zero = ethers.BigNumber.from(0);

async function currentBlockNumber() {
  return provider._getFastBlockNumber();
}

async function snapshot(targetBlockNumber) {
  // optional parameter to index only until this block number, otherwise until blockchain tip
  if (targetBlockNumber) {
    targetBlockNumber = parseInt(targetBlockNumber);
    if (!targetBlockNumber) {
      throw Error("Invalid target block number")
    }
  }

  const now = await currentBlockNumber();
  const scanBlockStop = targetBlockNumber || now;

  // block batching size 10000 is maximum
  const blockBatch = 10000;

  // start at the checkpoint block found, otherwise nearest round block before first mistbar event
  const scanBlockStart = 990000;

  // load checkpoint data if available
  let balanceMap = {};

  // main processing
  for (let i = scanBlockStart + 1; i < scanBlockStop; i += blockBatch) {
    const nextStop = i + blockBatch - 1;
    const to = nextStop > scanBlockStop ? scanBlockStop : nextStop;

    console.log(`Processing blocks from ${i} to ${to}`);

    const mistBarAddress = "0xC41C680c60309d4646379eD62020c534eB67b6f4";
    const params = {
      address: mistBarAddress,
      fromBlock: i,
      toBlock: to,
      topics: [sep20TransferTopic, null, null],
    };

    // retreive logs and process xMIST transfers
    const logs = await provider.getLogs(params);
    for (const log of logs) {
      const from = "0x" + log.topics[1].substring(26);
      const to = "0x" + log.topics[2].substring(26);

      if (to !== ethers.constants.AddressZero) {
        balanceMap[to] = (balanceMap[to] || zero).add(ethers.BigNumber.from(log.data));
      }

      if (from !== ethers.constants.AddressZero) {
        balanceMap[from] = balanceMap[from].sub(ethers.BigNumber.from(log.data));
        if (balanceMap[from].eq(0)) {
          // delete zero balances
          delete balanceMap[from];
        }
      }
    }
  }

  console.log(balanceMap)
  return balanceMap;
}

snapshot();
