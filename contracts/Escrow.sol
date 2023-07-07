// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;
import "./Price.sol";
import "./Queue.sol";

contract Escrow {
    Queue public tasks;
    uint256 public taskPrice;
    uint256 public taskPriceOffset;
    bool public isActive;    // 1 if has tasks in process, 0 if not currently working
    address immutable public Investor;
    address immutable public Worker;

    event TaskAdded(string _task);
    event TaskStarted(string _task);
    event TaskFinished(string _task);
    event Funded(uint256 _amount, address _funder); // Unit : wei

    constructor() {
        tasks = new Queue();
        Investor = msg.sender; // my Account1
        isActive = true;
        Worker = Investor;
    }

    function viewTask() public view returns (string memory) {
        return tasks.top();
    }

    function viewBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function viewBalanceInString() public view returns (string memory) {
        return Price.Uint256ToString(viewBalance());
    }

    function viewBalanceInUSD() public view returns (uint256) {
        return Price.convertToUSD(address(this).balance);
    }

    function taskCount() public view returns (uint256) {
        return tasks.size();
    }

    function addTask(string calldata _task) external onlyInvestor {
        tasks.push(_task);
        emit TaskAdded(_task);
    }

    function fund() external onlyInvestor payable {
        emit Funded(msg.value, msg.sender);
    }

    function startTask() external onlyWorker {
        require (taskCount() > 0, "No more tasks left!");
        taskPrice = address(this).balance / tasks.size();
        taskPriceOffset += (address(this).balance - (tasks.size() * taskPrice));
        require (address(this).balance > 0 && address(this).balance >= taskPrice, "Not enough fund to reward worker!");
        emit TaskStarted(tasks.top());
        isActive = false;
        emit TaskFinished(tasks.top());       
    }

    function reportTaskFinished() external onlyWorker {
        emit TaskFinished(tasks.top());
        tasks.pop();

        // Workers get paid in small batzches of money for each individual task they complete
        (bool callSuccess, ) = payable(Worker).call{value: taskPrice + taskPriceOffset}("Congrats on finishing a task, here is your reward!");
        require (callSuccess, "Error occured! Cannot reward worker, transaction has been reverted!");
    }

    modifier onlyInvestor() {
        require (msg.sender == Investor, "Only the Investor/Owner of this contract is allowed to perform this action!");
        _;
    }

    modifier onlyWorker() {
        require (msg.sender == Worker, "Only the worker is allowed to perform this action!");
        _;
    }

    modifier active {
        require (isActive == true, "Tasks already in progress, can't deposit more funds, please wait until the all tasks from previous sessions are done!");
        _;
    }

    // If someone who is not the primary investor wants to donate some funds for the worker, the contract also keep it.
    receive() external payable {
        emit Funded(msg.value, msg.sender);
    }
}