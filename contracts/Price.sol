// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library Price {
    function getPrice() public view returns (uint256) {
        AggregatorV3Interface pricefeed;
        pricefeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        ); // ETH/USD pricefeed for the Goerli testnet
        (, int256 price, , , ) = pricefeed.latestRoundData();
        return uint256(price) / 1e8;
    }

    function convertToUSD(uint256 amount) public view returns (uint256) {
        return (amount * getPrice()) / 1e18;
    }

    function Uint256ToString(uint256 value) public pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
