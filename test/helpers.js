const getBalance = async (address) => {
  return await ethers.provider.getBalance(address);
};

const getTimestamp = async () => {
  const block = await ethers.provider.getBlock('latest');
  return block.timestamp;
};

const getGasUsed = async (tx) => {
  const { cumulativeGasUsed, effectiveGasPrice } = await tx.wait();
  return cumulativeGasUsed.mul(effectiveGasPrice);
};

module.exports = {
  getBalance,
  getTimestamp,
  getGasUsed
}
