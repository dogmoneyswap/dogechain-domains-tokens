// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./uniswapv2/UniswapV2Router02.sol";

// This receives BCH from ENS

contract ENSBCHReceiver {
    using SafeMath for uint256;
    address public domain;
    address public bar;
    UniswapV2Router02 public router;

    constructor(address _domain, address _bar, address payable _router) public {
        domain = _domain;
        bar = _bar;
        router = UniswapV2Router02(_router);
    }

    // important to receive BCH
    receive() payable external {}

    // TODO add approval initialization with approving router 

    // Converts all BCH to domain and sends to bar
    function convert() public {
        // we do not care about price, so set this to minimum
        uint amountOutMin = 1;

        // path is just weth -> domain token
        address[] memory path = new address[](2);
        path[0] = router.WETH();
        path[1] = domain;

        // we send all purchased tokens to domain bar
        address to = bar;

        // we just set shortly in future
        uint deadline = block.timestamp + 100;

        // this is it, we just send all to the bar
        router.swapExactETHForTokens(amountOutMin, path, to, deadline);
    }
}
