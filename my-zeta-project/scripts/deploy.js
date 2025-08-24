const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // (옵션) 이미 배포된 ZRC-20 보상 토큰 주소가 있다면 .env에 넣어서 재사용
  // 없으면 로컬 테스트용 ERC20을 새로 배포합니다.
  let rewardTokenAddress = process.env.REWARD_TOKEN_ADDRESS;

  if (!rewardTokenAddress) {
    console.log("No REWARD_TOKEN_ADDRESS in .env -> deploying RewardToken for testing...");
    const RewardToken = await hre.ethers.getContractFactory("RewardToken");

    // 초기 발행량 (기본 1,000,000 RWD)
    const decimals = 18n;
    const supplyStr = process.env.INIT_SUPPLY || "1000000"; // 문자열로 받기
    const initialSupply = hre.ethers.parseUnits(supplyStr, decimals);

    const rewardToken = await RewardToken.deploy(initialSupply);
    await rewardToken.waitForDeployment();
    rewardTokenAddress = await rewardToken.getAddress();
    console.log("RewardToken deployed at:", rewardTokenAddress);
  } else {
    console.log("Using existing RewardToken:", rewardTokenAddress);
  }

  // CrossChainSwap 배포 (보상 토큰 주소를 생성자에 전달)
  const CrossChainSwap = await hre.ethers.getContractFactory("CrossChainSwap");
  const swap = await CrossChainSwap.deploy(rewardTokenAddress);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log("CrossChainSwap deployed at:", swapAddress);

  // 네트워크 안내
  const { chainId } = await hre.ethers.provider.getNetwork();
  console.log("Chain ID:", chainId.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
    