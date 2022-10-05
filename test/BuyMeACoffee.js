const { expect } = require('chai');
const { ethers } = require('hardhat');
const { smock } = require('@defi-wonderland/smock');
const { getBalance, getTimestamp, getGasUsed } = require('./helpers');

describe('BuyMeACoffee', function () {
  let owner, bob, alice, john, buyMeACoffee;
  const oneEth = ethers.utils.parseEther('1');
  const error = {
    NOT_OWNER: 'not owner',
    INVALID_AMOUNT: 'invalid tip amount',
    EMPTY_BALANCE: 'no balance',
    TRANSACTION_FAILED: 'transaction failed'
  };

  beforeEach(async () => {
    [owner, bob, alice, john] = await ethers.getSigners();
    const BuyMeACoffee = await ethers.getContractFactory('BuyMeACoffee');
    buyMeACoffee = await BuyMeACoffee.connect(owner).deploy();
  });

  it('should exist', () => {
    expect(buyMeACoffee).to.exist;
  });

  it('should store the contract owner addres', async () => {
    expect(await buyMeACoffee.owner()).to.equal(owner.address);
  });

  describe('#getBalance()', () => {
    it('should exist', () => {
      expect(buyMeACoffee.getBalance).to.exist;
    });

    it('should prevent access if not owner', async () => {
      await expect(buyMeACoffee.connect(bob).getBalance()).to.be.revertedWith(error.NOT_OWNER);
    });

    it('should return the contract balance', async () => {
      await buyMeACoffee.connect(bob).buyCoffee('Bob', 'Lorem Ipsum', { value: oneEth });
      await buyMeACoffee.connect(alice).buyCoffee('Alice', 'Dolor Simet', { value: oneEth });
      expect(await buyMeACoffee.getBalance()).to.equal(oneEth.mul(2));
    });
  });

  describe('#buyCoffee()', () => {
    it('should exist', () => {
      expect(buyMeACoffee.buyCoffee).to.exist;
    });

    it('should be payable', async () => {
      const initialBalance = await getBalance(buyMeACoffee.address);
      await buyMeACoffee.connect(bob).buyCoffee('Bob', 'Lorem Ipsum', { value: oneEth });
      const newBalance = await getBalance(buyMeACoffee.address);
      expect(newBalance).to.equal(initialBalance.add(oneEth));
    });

    it('should create a memo after tip is sent', async () => {
      const initialMemosArray = await buyMeACoffee.getMemos();
      await buyMeACoffee.connect(bob).buyCoffee('Bob', 'Lorem Ipsum', { value: oneEth });
      const newMemosArray = await buyMeACoffee.getMemos();
      expect(newMemosArray.length).to.equal(1);
      expect(initialMemosArray.length + 1).to.equal(newMemosArray.length);
      expect(newMemosArray[0].name).to.equal('Bob');
      expect(newMemosArray[0].message).to.equal('Lorem Ipsum');
      expect(newMemosArray[0].from).to.equal(bob.address);
      const timestamp = await getTimestamp();
      expect(newMemosArray[0].timestamp).to.equal(timestamp);
    });

    it('should emit a new memo creation event', async () => {
      await expect(buyMeACoffee.connect(bob).buyCoffee('Bob', 'Lorem Ipsum', { value: oneEth }))
        .to.emit(buyMeACoffee, 'NewMemo')
        .withArgs(bob.address, await getTimestamp() + 1, 'Bob', 'Lorem Ipsum');
    });

    it('should prevent zero eth tips', async () => {
      await expect(buyMeACoffee.connect(bob).buyCoffee('Bob', 'Lorem Ipsum', { value: 0 })).to.be.revertedWith(error.INVALID_AMOUNT);
    });
  });

  describe('#getMemos()', () => {
    it('should exist', () => {
      expect(buyMeACoffee.getMemos).to.exist;
    });

    it('should return an array of memos', async () => {
      const memos = await buyMeACoffee.getMemos();
      expect(Array.isArray(memos)).to.equal(true);
    });
  });

  describe('#withdrawTips()', () => {
    it('should exist', () => {
      expect(buyMeACoffee.withdrawTips).to.exist;
    });

    it('should prevent access if not owner', async () => {
      await expect(buyMeACoffee.connect(bob).withdrawTips()).to.be.revertedWith(error.NOT_OWNER);
    });

    it('should prevent withdraw when balance is zero', async () => {
      await expect(buyMeACoffee.connect(owner).withdrawTips()).to.be.revertedWith(error.EMPTY_BALANCE);
    });

    it('should withdraw contract funds', async () => {
      await buyMeACoffee.connect(bob).buyCoffee('Bob', 'Lorem Ipsum', { value: oneEth });
      const initialContractBalance = await buyMeACoffee.getBalance();
      const initialOwnerBalance = await owner.getBalance();
      const withdrawTx = await buyMeACoffee.connect(owner).withdrawTips();
      const gasUsed = await getGasUsed(withdrawTx);
      const finalContractBalance = await buyMeACoffee.getBalance();
      const finalOwnerBalance = await owner.getBalance();
      expect(initialContractBalance).to.equal(oneEth);
      expect(finalContractBalance).to.equal(0);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.add(oneEth).sub(gasUsed));
    });

    it('should revert with error when transaction fail', async () => {
      const mock = await smock.mock('BuyMeACoffee');
      const mockedContract = await mock.deploy();
      mockedContract.withdrawTips.reverts();
      await mockedContract.connect(bob).buyCoffee('Bob', 'Lorem Ipsum', { value: oneEth });
      await expect(mockedContract.connect(owner).withdrawTips()).to.be.revertedWith(error.TRANSACTION_FAILED);
    });
  });
});
