#!/bin/bash

curl "https://sonar.cash/api?module=token&action=getTokenHolders&contractaddress=0xBE7E034c86AC2a302f69ef3975e3D14820cC7660&page=0&offset=1000" > xlnsholders.json
curl "https://sonar.cash/api?module=token&action=getTokenHolders&contractaddress=0x35b3Ee79E1A7775cE0c11Bd8cd416630E07B0d6f&page=0&offset=1000" > lnsholders.json

