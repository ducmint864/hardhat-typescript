    // SPDX-License-Identifier: MIT

    pragma solidity ^0.8.9;

    contract Queue {
        uint256 public front;
        uint256 public rear;
        string[] public data;

        constructor() {
            front = 0;
            rear  = 0; 
            data = new string[](10) ;
        }

        function push(string calldata _element) public {
            require (rear < 9, "Maximum capacity of queue is 10, can't exceed it!");
            data [rear] = _element;
            rear++;
        }

        function pop() external notEmpty {
            delete data[front];
            front++;
        }

        function top() public notEmpty view returns (string memory) {
            return data[front];
        }

        function empty() public view returns (bool) {
            return (front == rear);
        }

        function size() public view returns (uint256) {
            return rear - front;
        }

        modifier notEmpty() {
            require(front < rear, "Queue is empty");
            _;
        }
    }