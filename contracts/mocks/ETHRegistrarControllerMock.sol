// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev A registrar controller for registering and renewing names at fixed cost.
 */
contract ETHRegistrarControllerMock is Ownable {

    constructor() public {
    }

    function register(string calldata name, address owner, uint duration, bytes32 secret) external payable {
    }

    function renew(string calldata name, uint duration) external payable {
    }

    function withdraw() public {
        payable(owner()).transfer(address(this).balance);
    }
}
