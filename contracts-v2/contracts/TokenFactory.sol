// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CampusToken.sol";

contract TokenFactory {
    event TokenDeployed(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 initialSupply,
        string metadataURI
    );

    mapping(address => address[]) public creatorTokens;
    address[] public allTokens;

    function createToken(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        string calldata metadataURI
    ) external returns (address) {
        CampusToken token = new CampusToken(
            name,
            symbol,
            initialSupply,
            msg.sender
        );
        address tokenAddr = address(token);
        creatorTokens[msg.sender].push(tokenAddr);
        allTokens.push(tokenAddr);
        emit TokenDeployed(
            tokenAddr,
            msg.sender,
            name,
            symbol,
            initialSupply,
            metadataURI
        );
        return tokenAddr;
    }

    function getCreatorTokens(address creator) external view returns (address[] memory) {
        return creatorTokens[creator];
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
}