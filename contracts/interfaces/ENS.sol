// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

interface ENS {
    function resolver(bytes32 node) external view returns (address);
}
