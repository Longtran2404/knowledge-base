/**
 * Wallet Connect Component
 * UI for connecting Web3 wallets
 */

import React, { useState, useEffect } from 'react';
import { Wallet, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { walletService, WalletInfo, SUPPORTED_CHAINS } from '../../services/web3/wallet-service';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

export const WalletConnect: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected
    const info = walletService.getWalletInfo();
    if (info) {
      setWalletInfo(info);
    }

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountChange);
      window.ethereum.on('chainChanged', handleChainChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
        window.ethereum.removeListener('chainChanged', handleChainChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccountChange = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      handleDisconnect();
    } else {
      // Account changed, reconnect
      try {
        const info = await walletService.connectMetaMask();
        setWalletInfo(info);
      } catch (error) {
        console.error('Failed to reconnect:', error);
      }
    }
  };

  const handleChainChange = () => {
    // Reload page on chain change (recommended by MetaMask)
    window.location.reload();
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const info = await walletService.connectMetaMask();
      setWalletInfo(info);
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${formatAddress(info.address)}`,
      });
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    walletService.disconnect();
    setWalletInfo(null);
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  const handleSwitchNetwork = async (chainKey: keyof typeof SUPPORTED_CHAINS) => {
    try {
      await walletService.switchNetwork(chainKey);
      toast({
        title: 'Network Switched',
        description: `Switched to ${SUPPORTED_CHAINS[chainKey].name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Network Switch Failed',
        description: error.message || 'Failed to switch network',
        variant: 'destructive',
      });
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getChainName = (chainId: number): string => {
    const chain = Object.values(SUPPORTED_CHAINS).find((c) => c.chainId === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  const getBlockExplorerUrl = (chainId: number, address: string): string => {
    const chain = Object.values(SUPPORTED_CHAINS).find((c) => c.chainId === chainId);
    return chain ? `${chain.blockExplorer}/address/${address}` : '';
  };

  if (!walletInfo) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your Web3 wallet to unlock blockchain features:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-4 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Earn blockchain-verified NFT certificates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Pay with cryptocurrency (ETH, MATIC, USDT)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Access exclusive Web3 features</span>
              </li>
            </ul>
          </div>
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
          {typeof window.ethereum === 'undefined' && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 justify-center">
              <AlertCircle className="w-4 h-4" />
              <span>
                MetaMask not detected.{' '}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Install MetaMask
                </a>
              </span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{formatAddress(walletInfo.address)}</p>
                <Badge variant="default" className="text-xs bg-green-600 text-white border-green-600">
                  Connected
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getChainName(walletInfo.chainId)}
              </p>
            </div>
          </div>
          <Button onClick={handleDisconnect} variant="outline" size="sm">
            Disconnect
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Balance</p>
            <p className="text-lg font-semibold">
              {parseFloat(walletInfo.balance).toFixed(4)}{' '}
              {walletInfo.chainName === 'matic' ? 'MATIC' : 'ETH'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Network</p>
            <p className="text-sm font-semibold">{getChainName(walletInfo.chainId)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Switch Network:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleSwitchNetwork('ethereum')}
              variant="outline"
              size="sm"
              disabled={walletInfo.chainId === SUPPORTED_CHAINS.ethereum.chainId}
            >
              Ethereum
            </Button>
            <Button
              onClick={() => handleSwitchNetwork('polygon')}
              variant="outline"
              size="sm"
              disabled={walletInfo.chainId === SUPPORTED_CHAINS.polygon.chainId}
            >
              Polygon
            </Button>
            <Button
              onClick={() => handleSwitchNetwork('bsc')}
              variant="outline"
              size="sm"
              disabled={walletInfo.chainId === SUPPORTED_CHAINS.bsc.chainId}
            >
              BSC
            </Button>
            <Button
              onClick={() => handleSwitchNetwork('polygonMumbai')}
              variant="outline"
              size="sm"
              disabled={walletInfo.chainId === SUPPORTED_CHAINS.polygonMumbai.chainId}
            >
              Mumbai (Test)
            </Button>
          </div>
        </div>

        <a
          href={getBlockExplorerUrl(walletInfo.chainId, walletInfo.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          View on Block Explorer
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
};

export default WalletConnect;
