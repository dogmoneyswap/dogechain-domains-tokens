// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Sablier/interfaces/ISablier.sol";
import "./Sablier/Sablier.sol";

// This contract receives domain tokens and allows owner to set up sablier
// streams for recipients. Only the recipients are able to cancel them.
// Expected usage is to:
// 1. instantiate
// 2. transfer to dev
// 3. receive tokens
// 4. have dev create the streams
// 5. have dev revoke ownership
contract SafeVesting is Ownable {
    using SafeMath for uint256;

    ISablier public sablier;

    constructor(address _sablier) public {
        sablier = ISablier(_sablier);
    }

    // emits CreateStream event
    // have to have tokens transferred to this contract beforehand
    function createStream(
        address recipient,
        address _token,
        uint256 amount,
        uint256 timelength
    ) external onlyOwner returns (uint256) {
        IERC20 token = IERC20(_token);
        token.approve(address(sablier), type(uint256).max);

        return sablier.createStream(
            recipient,
            amount,
            _token,
            block.timestamp + 30,
            block.timestamp + 30 + timelength
        );
    }
}
