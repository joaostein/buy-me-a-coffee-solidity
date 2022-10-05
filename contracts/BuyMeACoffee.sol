// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BuyMeACoffee {
  // Event to emit when a new memo is created
  event NewMemo(
    address from,
    uint256 timestamp,
    string name,
    string message
  );

  // Memo is a nice message that someone can leave when sending a tip
  struct Memo {
    address from;
    uint256 timestamp;
    string name;
    string message;
  }

  // List of all memos received
  Memo[] memos;

  // Address of the contract deployer
  address public owner;

  constructor () {
    owner = msg.sender;
  }

  modifier onlyOwner {
    require(msg.sender == owner, "not owner");
    _;
  }

  function getBalance () public view onlyOwner returns (uint256) {
    return address(this).balance;
  }

  /**
   * @dev buy a coffee for contract owner
   * @param _name name of the coffee buyer
   * @param _message a nice message from the coffee buyer
   */
  function buyCoffee (string memory _name, string memory _message) external payable {
    require(msg.value > 0, "invalid tip amount");

    // Add the memo to storage
    memos.push(Memo(
      msg.sender,
      block.timestamp,
      _name,
      _message
    ));

    // Emit a log event when a new memo is created
    emit NewMemo(
      msg.sender,
      block.timestamp,
      _name,
      _message
    );
  }

  /**
   * @dev withdraw the entire balance stored in this contract to the owner address
   */
  function withdrawTips () external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "no balance");
    (bool success, ) = owner.call{value: balance}("");
    require(success, "transaction failed");
  }

  /**
   * @dev return a list of all memos in storage
   */
  function getMemos () external view returns (Memo[] memory) {
    return memos;
  }
}
