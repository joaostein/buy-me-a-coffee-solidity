const { expect } = require('chai');

describe('BuyMeACoffee', function () {
  let owner, bob, alice, john, buyMeACoffee;

  beforeEach(async () => {
    [owner, bob, alice, john] = await ethers.getSigners();
    const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
    buyMeACoffee = await BuyMeACoffee.connect(owner).deploy();
  });

  it('should exist', () => {
    expect(buyMeACoffee).to.exist;
  });

  it('should store the contract owner addres', async () => {
    expect(await buyMeACoffee.owner()).to.equal(owner.address);
  });
});
