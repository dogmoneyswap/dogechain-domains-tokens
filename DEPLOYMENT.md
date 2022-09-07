# send 50% to vesting contract
npx hardhat --network dogechain-testnet erc20:transfer --recipient "SAFE_VESTING" --token "DOMAIN_TOKEN" --amount "500000000000000000000000"
 
# set up vesting
# update recipient addresses for gilgames, kasumi, and pat
# python: ((200000 * 10 ** 18) // (180 * 24 * 60 * 60)) * (180 * 24 * 60 * 60) 
# gilgames
npx hardhat --network dogechain-testnet vesting:create --recipient "GILGAMES" --token "DOMAIN_TOKEN" --amount "199999999999999984896000" --timelength "15552000"
# pat
npx hardhat --network dogechain-testnet vesting:create --recipient "PAT" --token "DOMAIN_TOKEN" --amount "149999999999999988672000" --timelength "15552000"
# kasumi
npx hardhat --network dogechain-testnet vesting:create --recipient "KASUMI" --token "DOMAIN_TOKEN" --amount "149999999999999988672000" --timelength "15552000"



# send 10.5% to mistbarconverter and set up dogmoney staking
npx hardhat --network dogechain-testnet erc20:transfer --recipient "MIST_BAR_CONVERTER" --token "DOMAIN_TOKEN" --amount "105000000000000000000000"
npx hardhat --network dogechain-testnet converter:stake

# send 1.5% to safe
npx hardhat --network dogechain-testnet erc20:transfer --recipient "DOGESAFE" --token "DOMAIN_TOKEN" --amount "15000000000000000000000"

# send 7.5 to pat
npx hardhat --network dogechain-testnet erc20:transfer --recipient "PAT" --token "DOMAIN_TOKEN" --amount "75000000000000000000000"

# send 7.5 to kasumi
npx hardhat --network dogechain-testnet erc20:transfer --recipient "KASUMI" --token "DOMAIN_TOKEN" --amount "75000000000000000000000"



# remaining tokens (15% + remainder of 5% from airdrop) sent to 2/3 safe held by kasumi, pat, gilgames
npx hardhat --network dogechain-testnet erc20:transfer --recipient "DOGESAFE" --token "DOMAIN_TOKEN" --amount "150000000000000000000000"

 
# testing receiver
# transfer ownership of ETHRegistrarController to ENSBCHReceiver (different repo)
# buy a domain using interface
npx hardhat --network dogechain-testnet receiver:convert


----


# 3% now used for airdrop to LNS holders (minus the mistbarconverter, mistswap, pat, kasumi, and safe_vesting addresses on smartbch)
 

# up to 5% is now airdropped to DNS purchasers
# 1 DNS per 5 letter domain
# 10 DNS for 4 letter domain
# etc

# remaining is sent to safe
