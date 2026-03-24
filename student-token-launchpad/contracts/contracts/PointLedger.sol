// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PointLedger {
    address public owner;
    mapping(string => uint256) private balances;

    event PointsCredited(string srn, uint256 points, string eventId, uint256 timestamp);
    event PointsDebited(string srn, uint256 points, string vendorId, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function recordCredit(string memory srn, uint256 points, string memory eventId) external onlyOwner {
        balances[srn] += points;
        emit PointsCredited(srn, points, eventId, block.timestamp);
    }

    function recordDebit(string memory srn, uint256 points, string memory vendorId) external onlyOwner {
        require(balances[srn] >= points, "Insufficient points");
        balances[srn] -= points;
        emit PointsDebited(srn, points, vendorId, block.timestamp);
    }

    function getBalance(string memory srn) external view returns (uint256) {
        return balances[srn];
    }
}
