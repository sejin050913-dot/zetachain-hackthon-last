// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";

contract CrossChainSwap {
    IZRC20 public rewardToken; // ZRC-20 토큰 (목적지 체인으로 보낼 대상 토큰)

    constructor(address _rewardTokenAddress) {
        rewardToken = IZRC20(_rewardTokenAddress);
    }

    /**
     * 사용자가 보상 토큰(ZRC-20)을 다른 체인으로 출금(Withdraw)합니다.
     * 주의:
     * - 이 컨트랙트는 사전에 `rewardToken` 과 "가스 ZRC-20" 둘 다를 보유하고 있어야 합니다.
     * - 가스 수수료는 "가스 ZRC-20"으로 지불됩니다.
     */
    function swap(
        uint256 amount,
        bytes calldata destinationAddress
    ) external {
        // 1) 사용자 토큰을 이 컨트랙트로 이동 (사용자 사전 approve 필요)
        bool ok = rewardToken.transferFrom(msg.sender, address(this), amount);
        require(ok, "transferFrom failed");

        // 2) 출금에 필요한 가스 토큰 주소와 수수료 조회
        //    - gasZRC20: 대상 체인의 가스 토큰(ZRC-20) 주소
        //    - gasFee  : 필요한 가스 수수료 양
        (address gasZRC20, uint256 gasFee) = rewardToken.withdrawGasFee();
        require(amount > gasFee, "amount <= gasFee");

        // 3) 이 컨트랙트가 가진 가스 ZRC-20으로 수수료 지불을 허용
        //    구현체는 zrc20.withdraw 내부에서 `transferFrom(msg.sender, FUNGIBLE_MODULE, gasFee)`
        //    를 수행하므로, spender를 gasZRC20(자기 자신)으로 approve하는 패턴을 사용합니다.
        bool ok2 = IZRC20(gasZRC20).approve(gasZRC20, gasFee);
        require(ok2, "approve gas failed");

        // 4) 대상 체인 수신자에게 토큰 출금
        //    구현/버전에 따라 수수료는 별도 징수되기도 하고, 잔액에서 차감되기도 합니다.
        //    가장 보수적으로 amount - gasFee를 출금하도록 합니다.
        bool ok3 = rewardToken.withdraw(destinationAddress, amount - gasFee);
        require(ok3, "withdraw failed");
    }
}
