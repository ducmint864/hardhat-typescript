// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library Price {
    function getPrice(AggregatorV3Interface _price_feed) public view returns (uint256) {            
        (, int256 price, , , ) = _price_feed.latestRoundData();
        return uint256(price) / 1e8;
    }

    function convertToUSD(AggregatorV3Interface _price_feed, uint256 amount) public view returns (uint256) {
        return (amount * getPrice(_price_feed)) / 1e18;
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
