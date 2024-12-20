import { validateAddress } from '@/utils/safe';
import { isAddress } from 'ethers';

jest.mock('ethers', () => ({
  isAddress: jest.fn(),
  Network: {
    from: jest.fn(),
  },
}));

describe('validateAddress', () => {
  it('should not throw for a valid address', () => {
    jest.mocked(isAddress).mockReturnValue(true);

    expect(() => validateAddress('0x1234567890abcdef1234567890abcdef12345678')).not.toThrow();
  });

  it('should throw an error for an invalid address', () => {
    jest.mocked(isAddress).mockReturnValue(false);

    expect(() => validateAddress('invalid-address')).toThrow('Invalid  address');
  });

  it('should include the name in the error message if provided', () => {
    jest.mocked(isAddress).mockReturnValue(false);

    expect(() => validateAddress('invalid-address', 'SAMM')).toThrow('Invalid SAMM address');
  });
});

import { getNetworkNameByChainId } from '@/utils/safe';
import { Network } from 'ethers';

describe('getNetworkNameByChainId', () => {
  it('should return the network name for a valid chain ID', () => {
    (Network.from as jest.Mock).mockReturnValue({ name: 'mainnet' });

    const result = getNetworkNameByChainId(1);
    expect(result).toBe('mainnet');
  });

  it('should return "Unknown Network" for an invalid chain ID', () => {
    (Network.from as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid chain ID');
    });

    const result = getNetworkNameByChainId(9999);
    expect(result).toBe('Unknown Network (chainId: 9999)');
  });
});
