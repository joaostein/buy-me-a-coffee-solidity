# Buy me a coffee contract

## Spec:
- The contract must store the payable owner address
- A user can send ETH to the contract owner (aka "buy me a coffee")
- The contract owner can view the contract balance
- The contract must prevent a user from sending zero ETH
- The contract must store a list with all the memos
  - Memo params: sender address, block timestamp, sender name, custom message
- A user can fetch all the memos
- The contract must create a memo when a tip is received
- The contract must emit a new memo event when a memo is created
- The contract owner can withdraw the tips from the contract balance
