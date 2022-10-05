# Buy me a coffee contract

## Spec:
- The contract must store the payable owner address
- The contract must prevent a user from sending zero ETH tip
- The contract owner can withdraw the tips from the contract balance
- A user can send ETH to the contract owner (aka "buy me a coffee")
- The contract must create a memo when a tip is sent
  - Memo params: sender address, block timestamp, sender name, custom message
  - The contract must emit a new memo event when a memo is created
  - The contract must store a list with all the memos
- A user can fetch all the memos
