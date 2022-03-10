# BCH Domain Auxillary Contracts

https://bch.domains

## Docs

[Development](docs/DEVELOPMENT.md)

[Deployment](docs/DEPLOYMENT.md)

## Security

[Security Policy](SECURITY.md)

## License

[MIT](LICENSE.txt)

### setup

```
yarn smartbch-amber:deploy

# send 50% to vesting contract
npx hardhat --network smartbch-amber erc20:transfer --recipient "SAFE_VESTING" --token "DOMAIN_TOKEN" --amount "500000000000000000000000"

# send 35% to mistbarconverter and set up mist staking
npx hardhat --network smartbch-amber erc20:transfer --recipient "MIST_BAR_CONVERTER" --token "DOMAIN_TOKEN" --amount "350000000000000000000000"
npx hardhat --network smartbch-amber converter:stake

# set up lp with 2.5%/2.5%
npx hardhat --network smartbch-amber erc20:transfer --recipient "0x07D4115bCDb2b709ff07d0dA11f5Da7D85C5b769" --token "DOMAIN_TOKEN" --amount "25000000000000000000000"
# mainnet only: sell 50,000 FLEXUSD for BCH
# go onto app.mistswap.fi and create lp using LP_WALLET with BCH/LNS pair

# distribute to private sale
npx hardhat --network smartbch-amber erc20:transfer --recipient "0xbc903372c2860b7c1DA5454f69e6A580f562313e" --token "DOMAIN_TOKEN" --amount "40000000000000000000000"
npx hardhat --network smartbch-amber erc20:transfer --recipient "0x35FB9645AF6AfF1107Eb210B4049b7AE0B510143" --token "DOMAIN_TOKEN" --amount "10000000000000000000000"

# distribute to private liquidity sale
npx hardhat --network smartbch-amber erc20:transfer --recipient "0xF58472B4C70423EffFb8a6C0D3E69649B489525a" --token "DOMAIN_TOKEN" --amount "17500000000000000000000"
npx hardhat --network smartbch-amber erc20:transfer --recipient "0x6e8102BfEBfE833302D2D6De10cc76aFc4dB133d" --token "DOMAIN_TOKEN" --amount "7500000000000000000000"


# set up vesting
# update recipient addresses for mistswap and pat
# python: ((250000 * 10 ** 18) // (365 * 24 * 60 * 60)) * (365 * 24 * 60 * 60) 
# mistswap
npx hardhat --network smartbch-amber vesting:create --recipient "0x07D4115bCDb2b709ff07d0dA11f5Da7D85C5b769" --token "DOMAIN_TOKEN" --amount "249999999999999980256000" --timelength "31536000"
# pat
npx hardhat --network smartbch-amber vesting:create --recipient "0x3F539aFb04a6C3b3CdfDB08889d63FD14987F251" --token "DOMAIN_TOKEN" --amount "249999999999999980256000" --timelength "31536000"

# testing receiver
# transfer ownership of ETHRegistrarController to ENSBCHReceiver (different repo)
# buy a domain using interface
npx hardhat --network smartbch-amber receiver:convert


# test setup correct
npx hardhat --network smartbch-amber converter:convert


# distribute to xmist holders
npx hardhat --network smartbch-amber snapshot | tee snapshot.sh
# take above output and send with prefix:
# #!/bin/bash
# set -x
# set -e


# edit lns-app /src/routes/Stake to update domains

# add token icons to mistswap assets
# add token to default token list (publish new list, update interface to use new list)
```
