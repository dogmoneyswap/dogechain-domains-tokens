// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DomainBar.sol";
import "./uniswapv2/UniswapV2Router02.sol";

// This receives BCH from ENS

contract ENSBCHReceiver is Ownable {
    using SafeMath for uint256;

    IERC20 public domain;
    address public bar;
    UniswapV2Router02 public router;

    constructor(
        address _domain,
        address _bar,
        address payable _router
    ) public {
        domain = IERC20(_domain);
        bar = _bar;
        router = UniswapV2Router02(_router);

        domain.approve(address(router), type(uint256).max);
    }

    event Received(address, uint);
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    // this is imported from https://github.com/mistswapdex/mistswap/blob/master/contracts/governance/Timelock.sol
    event CallTarget(bytes32 indexed txHash, address indexed target, uint value, string signature,  bytes data);
    function callTarget(address target, uint value, string memory signature, bytes memory data) public payable onlyOwner returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data));
        bytes memory callData;

        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }

        // solium-disable-next-line security/no-call-value
        (bool success, bytes memory returnData) = target.call.value(value)(callData);
        require(success, "ENSBCHReceiver::callTarget: Transaction execution reverted.");

        emit CallTarget(txHash, target, value, signature, data);

        return returnData;
    }

    // Converts all held BCH to domain and sends to bar
    function convert() public {
        // we do not care about price, so set this to minimum
        uint256 amountOutMin = 1;

        // path is just weth -> domain token
        address[] memory path = new address[](2);
        path[0] = router.WETH();
        path[1] = address(domain);

        // we send all purchased tokens to domain bar
        address to = address(bar);

        // max deadline
        uint256 deadline = type(uint256).max;

        // this is it, we just send all to the bar
        router.swapExactETHForTokens{value: address(this).balance}(
            amountOutMin,
            path,
            to,
            deadline
        );
    }
}
