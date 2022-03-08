// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./DomainBar.sol";
import "./uniswapv2/UniswapV2Router02.sol";

// This receives 35% of all DOMAIN tokens
// is used to convert staked tokens for mist and send to mistbar
contract MistBarConverter {
    using SafeMath for uint256;
    uint256 public reservedAmount; // how much to keep locked in staking
    IERC20 public domain;
    DomainBar public domainbar;
    address public mist;
    address public mistbar;
    UniswapV2Router02 public router;

    constructor(
        uint256 _reservedAmount,
        address _domain,
        address _domainbar,
        address _mist,
        address _mistbar,
        address payable _router
    ) public {
        reservedAmount = _reservedAmount;
        domain = IERC20(_domain);
        domainbar = DomainBar(_domainbar);
        mist = _mist;
        mistbar = _mistbar;
        router = UniswapV2Router02(_router);

        domain.approve(address(domainbar), type(uint256).max);
        domain.approve(address(router), type(uint256).max);
    }

    // stakes all domain tokens held
    // this must be public to allow for setup with the reserved amount
    function stakeDomain() public {
        uint256 amount = domain.balanceOf(address(this));
        domainbar.enter(amount);
    }

    // unstakes all domain tokens held
    function unstakeDomain() internal {
        uint256 amount = domainbar.balanceOf(address(this));
        if (amount > 0) {
            domainbar.leave(amount);
        }
    }

    // Converts all excess domain to mist and sends to mistbar
    function convert() public {
        // stage 1 - unstake all
        unstakeDomain();

        // stage 2 - check our domain balance is above reservedAmount
        // since the balance is increasing from purchases/staked amount

        // uses safemath to guarantee no overflow (which would imply reservedAmount not set yet)
        uint256 delta = domain.balanceOf(address(this))
            .sub(reservedAmount, "MistBarConverter: negative delta");

        // need at least some to bother, 0 in for swaps is weird
        require(delta > 0, "MistBarConverter: minimum balance");

        // stage 3 - calculates amount of domain above reservedAmount
        // and sets up a swap from domain -> mist for mistbar

        // we do not care about price, so set this to minimum
        uint256 amountOutMin = 1;

        // path is domain -> wbch -> mist
        address[] memory path = new address[](3);
        path[0] = address(domain);
        path[1] = router.WETH();
        path[2] = mist;

        // we send all purchased tokens to mist bar
        address to = mistbar;

        // max deadline
        uint256 deadline = type(uint256).max;

        // this is it, we just send all mist to the mistbar
        router.swapExactTokensForTokens(delta, amountOutMin, path, to, deadline);

        // stage 4 - restake all remaining domain tokens
        stakeDomain();
    }
}
