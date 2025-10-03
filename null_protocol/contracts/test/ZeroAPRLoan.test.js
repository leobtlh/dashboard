import { describe, it, beforeEach } from "node:test";
import { expect } from "chai";
import { createWallet, deployContract, parseEther } from "viem";
import ZeroAPRLoanArtifact from "../artifacts/contracts/ZeroAPRLoan.sol/ZeroAPRLoan.json";
import ERC20MockArtifact from "../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json";

describe("ZeroAPRLoan contract", () => {
  let zeroAPRLoan;
  let owner, borrower;
  let stableTokenMock;

  beforeEach(async () => {
    // Créer des wallets pour owner et borrower
    owner = createWallet({ seed: "owner" });
    borrower = createWallet({ seed: "borrower" });

    // Déployer le token mock
    stableTokenMock = await deployContract({
      abi: ERC20MockArtifact.abi,
      bytecode: ERC20MockArtifact.bytecode,
      args: ["Mock DAI", "DAI", borrower.address, parseEther("1000")],
      signer: owner,
    });

    // Déployer le contrat ZeroAPRLoan
    zeroAPRLoan = await deployContract({
      abi: ZeroAPRLoanArtifact.abi,
      bytecode: ZeroAPRLoanArtifact.bytecode,
      args: [
        owner.address,        // mock Aave
        stableTokenMock.address,
        owner.address,        // mock ETH/USD oracle
        owner.address,        // mock stable/USD oracle
      ],
      signer: owner,
    });
  });

  it("Should allow requesting a loan with enough collateral", async () => {
    const loanAmount = parseEther("100");
    const collateral = parseEther("5");

    // Ici on utilise directement Viem pour appeler la fonction payable
    const tx = await zeroAPRLoan.requestLoan(loanAmount, {
      value: collateral,
      signer: borrower,
    });

    await tx.wait(); // attendre la confirmation

    expect(tx).to.not.be.null;
  });

  it("Should revert if collateral is insufficient", async () => {
    const loanAmount = parseEther("100");
    const collateral = parseEther("1");

    let threw = false;
    try {
      const tx = await zeroAPRLoan.requestLoan(loanAmount, {
        value: collateral,
        signer: borrower,
      });
      await tx.wait();
    } catch (e) {
      threw = true;
      expect(e.message).to.match(/insufficient collateral/i);
    }

    expect(threw).to.be.true;
  });
});
