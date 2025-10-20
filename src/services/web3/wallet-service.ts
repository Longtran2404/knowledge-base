/**
 * Web3 Wallet Service
 * Blockchain wallet integration for Nam Long Center
 *
 * Features:
 * - MetaMask, WalletConnect, Coinbase Wallet support
 * - Multi-chain support (Ethereum, Polygon, BSC)
 * - NFT certificate minting
 * - Token payments
 * - Smart contract interactions
 */

import { ethers } from 'ethers';
import { logger } from '../../lib/logger/logger';

export interface WalletInfo {
  address: string;
  chainId: number;
  chainName: string;
  balance: string;
  provider: 'metamask' | 'walletconnect' | 'coinbase';
}

export interface NFTCertificate {
  tokenId: string;
  courseName: string;
  studentName: string;
  completionDate: Date;
  certificateHash: string;
  ipfsUrl: string;
  transactionHash?: string;
}

export const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  bsc: {
    chainId: 56,
    name: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  polygonMumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
} as const;

class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private walletInfo: WalletInfo | null = null;

  /**
   * Connect to MetaMask wallet
   */
  async connectMetaMask(): Promise<WalletInfo> {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const address = accounts[0];
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(address);

      this.walletInfo = {
        address,
        chainId: Number(network.chainId),
        chainName: network.name,
        balance: ethers.formatEther(balance),
        provider: 'metamask',
      };

      logger.info('MetaMask connected:', this.walletInfo);
      return this.walletInfo;
    } catch (error) {
      logger.error('Failed to connect MetaMask:', error);
      throw error;
    }
  }

  /**
   * Switch to specific blockchain network
   */
  async switchNetwork(chainKey: keyof typeof SUPPORTED_CHAINS): Promise<void> {
    if (!window.ethereum) throw new Error('No wallet provider found');

    const chain = SUPPORTED_CHAINS[chainKey];

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toQuantity(chain.chainId) }],
      });
    } catch (error: any) {
      // If chain doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ethers.toQuantity(chain.chainId),
              chainName: chain.name,
              rpcUrls: [chain.rpcUrl],
              nativeCurrency: chain.nativeCurrency,
              blockExplorerUrls: [chain.blockExplorer],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.walletInfo = null;
    logger.info('Wallet disconnected');
  }

  /**
   * Get current wallet info
   */
  getWalletInfo(): WalletInfo | null {
    return this.walletInfo;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return !!this.walletInfo;
  }

  /**
   * Mint NFT certificate for course completion
   */
  async mintNFTCertificate(certificate: Omit<NFTCertificate, 'tokenId' | 'transactionHash'>): Promise<NFTCertificate> {
    if (!this.signer) throw new Error('Wallet not connected');

    try {
      // Contract address (replace with actual deployed contract)
      const contractAddress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS || '';

      if (!contractAddress) {
        throw new Error('NFT contract address not configured');
      }

      // NFT Certificate Contract ABI (simplified)
      const contractABI = [
        'function mint(address to, string memory courseName, string memory studentName, uint256 completionDate, string memory certificateHash, string memory ipfsUrl) public returns (uint256)',
        'function tokenURI(uint256 tokenId) public view returns (string memory)',
      ];

      const contract = new ethers.Contract(contractAddress, contractABI, this.signer);

      // Mint the NFT
      const tx = await contract.mint(
        this.walletInfo!.address,
        certificate.courseName,
        certificate.studentName,
        Math.floor(certificate.completionDate.getTime() / 1000),
        certificate.certificateHash,
        certificate.ipfsUrl
      );

      logger.info('Minting NFT certificate...', tx.hash);
      const receipt = await tx.wait();

      // Get token ID from event logs
      const tokenId = receipt.logs[0].topics[3]; // Assuming Transfer event

      const nftCertificate: NFTCertificate = {
        ...certificate,
        tokenId: tokenId.toString(),
        transactionHash: receipt.hash,
      };

      logger.info('NFT certificate minted:', nftCertificate);
      return nftCertificate;
    } catch (error) {
      logger.error('Failed to mint NFT certificate:', error);
      throw error;
    }
  }

  /**
   * Pay with cryptocurrency
   */
  async payCrypto(amount: string, recipientAddress: string, token?: 'ETH' | 'MATIC' | 'USDT'): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected');

    try {
      let tx;

      if (token === 'USDT') {
        // ERC-20 token transfer (USDT example)
        const tokenAddress = process.env.REACT_APP_USDT_CONTRACT_ADDRESS || '';
        const tokenABI = [
          'function transfer(address to, uint256 amount) public returns (bool)',
        ];
        const contract = new ethers.Contract(tokenAddress, tokenABI, this.signer);

        const decimals = 6; // USDT has 6 decimals
        const tokenAmount = ethers.parseUnits(amount, decimals);

        tx = await contract.transfer(recipientAddress, tokenAmount);
      } else {
        // Native currency (ETH/MATIC/BNB)
        const value = ethers.parseEther(amount);
        tx = await this.signer.sendTransaction({
          to: recipientAddress,
          value,
        });
      }

      logger.info('Crypto payment sent:', tx.hash);
      const receipt = await tx.wait();
      logger.info('Payment confirmed:', receipt.hash);

      return receipt.hash;
    } catch (error) {
      logger.error('Crypto payment failed:', error);
      throw error;
    }
  }

  /**
   * Get balance of a specific token
   */
  async getTokenBalance(tokenAddress: string): Promise<string> {
    if (!this.provider || !this.walletInfo) throw new Error('Wallet not connected');

    try {
      const tokenABI = ['function balanceOf(address owner) view returns (uint256)'];
      const contract = new ethers.Contract(tokenAddress, tokenABI, this.provider);
      const balance = await contract.balanceOf(this.walletInfo.address);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      logger.error('Failed to get token balance:', error);
      throw error;
    }
  }

  /**
   * Sign message for authentication
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected');

    try {
      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error) {
      logger.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Verify wallet owns an NFT
   */
  async verifyNFTOwnership(contractAddress: string, tokenId: string): Promise<boolean> {
    if (!this.provider || !this.walletInfo) throw new Error('Wallet not connected');

    try {
      const nftABI = ['function ownerOf(uint256 tokenId) view returns (address)'];
      const contract = new ethers.Contract(contractAddress, nftABI, this.provider);
      const owner = await contract.ownerOf(tokenId);
      return owner.toLowerCase() === this.walletInfo.address.toLowerCase();
    } catch (error) {
      logger.error('Failed to verify NFT ownership:', error);
      return false;
    }
  }
}

// Singleton instance
export const walletService = new WalletService();
export default walletService;

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
