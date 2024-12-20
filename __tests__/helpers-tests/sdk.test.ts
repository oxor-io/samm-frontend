import { renderHook, act } from '@testing-library/react';
import { useSAMMStore } from '@/store/sammStore';
import { safeSDK } from '@/config/SDK';

jest.mock('@/config/SDK', () => ({
  safeSDK: {
    safe: {
      getInfo: jest.fn(),
    },
  },
}));

const fetchSafeInfo = async () => {
  const setIsSafeApp = useSAMMStore.getState().setIsSafeApp;

  let didResolve = false;

  const timeout = setTimeout(() => {
    if (!didResolve) {
      setIsSafeApp(false);
    }
  }, 2500);

  try {
    await safeSDK.safe.getInfo();
    didResolve = true;
    clearTimeout(timeout);
    setIsSafeApp(true);
  } catch (error) {
    didResolve = true;
    clearTimeout(timeout);
    setIsSafeApp(false);
  }
};

describe('fetchSafeInfo', () => {
  it('should set isSafeApp to true when SDK resolves', async () => {
    const setIsSafeApp = jest.fn();
    (safeSDK.safe.getInfo as jest.Mock).mockResolvedValueOnce({});

    renderHook(() => {
      useSAMMStore.setState({ setIsSafeApp });
    });

    await act(async () => {
      await fetchSafeInfo();
    });

    expect(setIsSafeApp).toHaveBeenCalledWith(true);
  });

  it('should set isSafeApp to false on SDK failure', async () => {
    const setIsSafeApp = jest.fn();
    (safeSDK.safe.getInfo as jest.Mock).mockRejectedValueOnce(new Error('Failure')); // Mock failure

    renderHook(() => {
      useSAMMStore.setState({ setIsSafeApp });
    });

    await act(async () => {
      await fetchSafeInfo();
    });

    expect(setIsSafeApp).toHaveBeenCalledWith(false);
  });
});

import { AlchemyProvider, BrowserProvider } from 'ethers';
import { getNetworkNameByChainId, getProvider } from '@/utils/safe';

jest.mock('ethers', () => ({
  AlchemyProvider: jest.fn(),
  BrowserProvider: jest.fn(),
}));

describe('getProvider', () => {
  it('should return AlchemyProvider if window.ethereum is not available', () => {
    delete (global as any).window.ethereum;

    const chainId = 11155111;
    getProvider(chainId);
    const network = getNetworkNameByChainId(chainId);

    expect(AlchemyProvider).toHaveBeenCalledWith(network);
  });

  it('should return BrowserProvider if window.ethereum is available', () => {
    (global as any).window.ethereum = {};
    const chainId = 11155111;

    getProvider(chainId);

    expect(BrowserProvider).toHaveBeenCalledWith((global as any).window.ethereum, chainId);
  });
});
