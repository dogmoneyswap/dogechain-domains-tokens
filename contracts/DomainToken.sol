// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Very simple ERC20 which is sent entirely to the receiver

contract DomainToken is ERC20("DomainToken", "DOMAIN") {
    constructor(address _receiver, uint256 _amount) public {
        _mint(_receiver, _amount);
    }
}
