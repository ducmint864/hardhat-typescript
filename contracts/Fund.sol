// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Price.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error Fund__NotOwner();
error Fund__BelowMinimum();

contract Fund {
    uint256 public constant MINIMUM_USD = 50;
    address private immutable i_owner;
    address[] private s_funders;
    mapping(address => uint256) private s_funderToAmount;
    AggregatorV3Interface private s_priceFeed;

    modifier OnlyOwner() {
        if (msg.sender != i_owner) revert Fund__NotOwner();
        _;
    }

    modifier MinimumAmountReached() {
        if (Price.convertToUSD(s_priceFeed, msg.value) < MINIMUM_USD)
            revert Fund__BelowMinimum();
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    function fund() public payable MinimumAmountReached {
        s_funderToAmount[msg.sender] += msg.value;
        for (uint i = 0; i < s_funders.length; i++) {
            if (s_funders[i] == msg.sender) return;
        }
        s_funders.push(msg.sender);
    }

    function withdraw() external OnlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            s_funderToAmount[s_funders[i]] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }(
            "Here is your fund withdrawal, please don't spend it on personal purposes."
        );
        require(callSuccess, "Cannot withdraw fund.");
    }
    
    function getFundersCount() external view returns (uint256) {
        return s_funders.length;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getPriceFeed() external view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getFunder(uint256 index) external view returns (address) {
        return s_funders[index];
    }

    function getFunderToAmount(address funder) external view returns (uint256) {
        return s_funderToAmount[funder];
    }
}
