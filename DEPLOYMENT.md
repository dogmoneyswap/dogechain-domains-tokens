# DOGESAFE is 0x2171a262875dac76C2d25f5e7849Cbdf5372c3e7

# PAT is 0xd13A458A1A1a4aE2b4624c7dba3A73C3A3Ccc817

# KASUMI is 0xcc28eB13488D01267350cf1F426a40a8546e4873

# GILGAMES is 0xfa75C34b764A686D068C8bc177FcE8A564d0fb56

# MISTBARCONVERTER is 0x2d9758a796dFb49c95EE9c36eA3B9D203a54F4cD

# DOMAINTOKEN is 0xe729ffC468e309F8d68bE26026C7A442D84caf2D

# SAFEVESTING = is 0xe85533a6C4CBfE0cE6eB147D2d0cAe1c79C60a38


# send 50% to vesting contract
npx hardhat --network dogechain erc20:transfer --recipient "0xe85533a6C4CBfE0cE6eB147D2d0cAe1c79C60a38" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "500000000000000000000000"
 
# set up vesting
# update recipient addresses for gilgames, kasumi, and pat
# python: ((200000 * 10 ** 18) // (180 * 24 * 60 * 60)) * (180 * 24 * 60 * 60) 
# gilgames
npx hardhat --network dogechain vesting:create --recipient "0xfa75C34b764A686D068C8bc177FcE8A564d0fb56" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "199999999999999984896000" --timelength "15552000"
# pat
npx hardhat --network dogechain vesting:create --recipient "0xd13A458A1A1a4aE2b4624c7dba3A73C3A3Ccc817" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "149999999999999988672000" --timelength "15552000"
# kasumi
npx hardhat --network dogechain vesting:create --recipient "0xcc28eB13488D01267350cf1F426a40a8546e4873" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "149999999999999988672000" --timelength "15552000"



# send 10.5% to mistbarconverter and set up dogmoney staking
npx hardhat --network dogechain erc20:transfer --recipient "0x2d9758a796dFb49c95EE9c36eA3B9D203a54F4cD" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "105000000000000000000000"
npx hardhat --network dogechain converter:stake

# send 1.5% to safe
npx hardhat --network dogechain erc20:transfer --recipient "0x2171a262875dac76C2d25f5e7849Cbdf5372c3e7" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "15000000000000000000000"

# send 7.5 to pat
npx hardhat --network dogechain erc20:transfer --recipient "0xd13A458A1A1a4aE2b4624c7dba3A73C3A3Ccc817" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "75000000000000000000000"

# send 7.5 to kasumi
npx hardhat --network dogechain erc20:transfer --recipient "0xcc28eB13488D01267350cf1F426a40a8546e4873" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "75000000000000000000000"



# remaining tokens (15% + remainder of 5% from airdrop) sent to 2/3 safe held by kasumi, pat, gilgames
npx hardhat --network dogechain erc20:transfer --recipient "0x2171a262875dac76C2d25f5e7849Cbdf5372c3e7" --token "0xe729ffC468e309F8d68bE26026C7A442D84caf2D" --amount "150000000000000000000000"

 
# testing receiver
# transfer ownership of ETHRegistrarController to ENSBCHReceiver (different repo)
# buy a domain using interface
npx hardhat --network dogechain receiver:convert


----


# 3% now used for airdrop to LNS holders (minus the mistbarconverter, mistswap, pat, kasumi, and safe_vesting addresses on smartbch)
 

# up to 5% is now airdropped to DNS purchasers
# 1 DNS per 5 letter domain
# 10 DNS for 4 letter domain
# etc

# remaining is sent to safe



##### ENSBCHReceiver deployment: do not forget to transfer  RegistararController's ownership to ENSBCHReceiver
