// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Price.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Fund {
    uint256 public constant MINIMUM_USD = 1;
    address public immutable OWNER;
    address[] public funders;
    mapping(address => uint256) public addressToAmount;
    AggregatorV3Interface public immutable priceFeed;

    modifier OnlyOwner() {
        require(
            msg.sender == OWNER,
            "Only the owner of this funding is allowed to withdraw the funded money!"
        );
        _;
    }

    modifier MinimumAmountReached() {
        require(
            Price.convertToUSD(priceFeed, msg.value) >= MINIMUM_USD,
            "Minimum amount not reached! Transaction has been reverted."
        );
        _;
    }

    receive() external payable {
        fund();
    }    

    fallback() external payable {
        fund();
    }

    constructor(address priceFeedAddress) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
        OWNER = msg.sender;
    }

    function fund() public payable MinimumAmountReached {
        addressToAmount[msg.sender] += msg.value;
        for (uint i = 0; i < funders.length; i++)
        {
            if (funders[i] == msg.sender)
                return;
        }
        funders.push(msg.sender);
    }

    function withdraw() public OnlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            addressToAmount[funders[i]] = 0;
        }
        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }(
            "Here is your fund withdrawal, please don't spend it on personal purposes."
        );
        require(callSuccess, "Cannot withdraw fund.");
    }

    function getFundersCount() public view returns (uint256) {
        return funders.length;
    }
}
