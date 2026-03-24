// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Distributor {
    event BatchDistributed(
        address indexed token,
        address indexed sender,
        uint256 recipientCount,
        uint256 totalAmount
    );

    function batchTransferEqual(
        address tokenAddress,
        address[] calldata recipients,
        uint256 amountEach
    ) external {
        require(recipients.length <= 200, "Max 200 recipients");
        IERC20 token = IERC20(tokenAddress);
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid address");
            token.transferFrom(msg.sender, recipients[i], amountEach);
        }
        emit BatchDistributed(tokenAddress, msg.sender, recipients.length, amountEach * recipients.length);
    }
}