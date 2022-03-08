// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev A registrar controller for registering and renewing names at fixed cost.
 */
interface IETHRegistrarController {
    function withdraw() external;
    function owner() external view returns (address);
}
