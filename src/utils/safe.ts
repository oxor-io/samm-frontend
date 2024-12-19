import {
  ContractInterface,
  BaseContract,
  Interface,
  InterfaceAbi,
  AlchemyProvider,
  AbiCoder,
  keccak256,
  isAddress,
  randomBytes,
  toBigInt,
  TypedDataEncoder,
  verifyTypedData,
  BrowserProvider,
  AddressLike,
  Log,
  Network,
} from 'ethers';

import SafeAppsSDK, { BaseTransaction } from '@safe-global/safe-apps-sdk';
import SafeProxyFactoryABI from '../../SafeProxyFactory.json';

import SammABI from '../../SAMM.json';
import { safeSDK } from '@/config/SDK';
import SAMM_CONFIG from '@/config/sammConfig';
import { Restriction } from '@/types/restriction';
import { ModuleFormData } from '@/containers/create-page/CreateModuleForm';
import { fetchMembersRoot } from './api';
import { SAMMData } from '@/types/samm';

let provider: AlchemyProvider | BrowserProvider | null = null;

export function getProvider(chainId: number): AlchemyProvider | BrowserProvider {
  // @ts-expect-error validation
  if (!window?.ethereum) {
    const network = getNetworkNameByChainId(chainId);
    // TODO right now we are using public api, but we could change it to increase bandwidth capabilities
    provider = new AlchemyProvider(network);
  }

  // @ts-expect-error validation
  provider = new BrowserProvider(window.ethereum, chainId);

  return provider;
}

export function getContractWithProvider(
  target: string,
  abi: Interface | InterfaceAbi,
  chainId: number
): BaseContract & Omit<ContractInterface, keyof BaseContract> {
  const provider = getProvider(chainId);
  return BaseContract.from(target, abi, provider);
}

export function getNetworkNameByChainId(chainId: number) {
  if (!chainId) return;
  try {
    const network = Network.from(chainId);
    return network.name;
  } catch (error) {
    console.error('Error in getNetworkNameByChainId:', error); // Ensure this logs the error
    return `Unknown Network (chainId: ${chainId})`;
  }
}

export async function getNonceFromSamm(sammAddress: string, chainId: number): Promise<bigint> {
  try {
    validateAddress(sammAddress, 'SAMM');

    const nonce = await getSammWithProvider(sammAddress, chainId).getNonce();
    return nonce;
  } catch (error) {
    throw new Error(
      `Failed to get nonce: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getSafe(
  samm: BaseContract & Omit<ContractInterface, keyof BaseContract>,
  chainId: number
): Promise<BaseContract & Omit<ContractInterface, keyof BaseContract>> {
  try {
    const nonceAbi = 'function nonce() view returns(uint256)';
    const safe = await samm.getSafe();
    if (!safe || typeof safe !== 'string') {
      throw new Error('Invalid safe address returned');
    }
    return getContractWithProvider(safe, [nonceAbi], chainId);
  } catch (error) {
    throw new Error(
      `Failed to get safe: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function getSammWithProvider(
  sammAddress: string,
  chainId: number
): BaseContract & Omit<ContractInterface, keyof BaseContract> {
  const provider = getProvider(chainId);
  return BaseContract.from(sammAddress, SammABI, provider);
}

export function getMsgHash(
  to: string,
  value: bigint | string,
  calldata: string,
  operation: bigint | string,
  nonce: bigint | string,
  deadline: bigint | string,
  sammAddress: string,
  chainId: bigint | string
): string {
  try {
    validateAddress(to, 'to (target)');
    validateAddress(sammAddress, 'SAMM');

    const calldataHash = keccak256(calldata);
    const encoder = AbiCoder.defaultAbiCoder();
    const encodedMsg = encoder.encode(
      ['address', 'uint256', 'bytes32', 'uint8', 'uint256', 'uint256', 'address', 'uint256'],
      [to, value, calldataHash, operation, nonce, deadline, sammAddress, chainId]
    );
    return keccak256(encodedMsg);
  } catch (error) {
    throw new Error(
      `Failed to generate message hash: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function validateAddress(address: string, name?: string): void {
  if (!isAddress(address)) {
    throw new Error(`Invalid ${name ?? ''} address`);
  }
}

export async function sendSafeTxWithOptionalValidation(
  safeSDK: SafeAppsSDK,
  tx: BaseTransaction,
  validationFunction?: () => Promise<void> // closure with actual validation function call inside
): Promise<string> {
  if (validationFunction) {
    await validationFunction();
  }

  return (
    await safeSDK.txs.send({
      txs: [tx],
    })
  ).safeTxHash;
}

export async function sendSafeTxWithOptionalValidationBatch(
  safeSDK: SafeAppsSDK,
  txs: BaseTransaction[],
  validationFunction?: () => Promise<void> // closure with actual validation function call inside
): Promise<string> {
  if (validationFunction) {
    await validationFunction();
  }

  return (
    await safeSDK.txs.send({
      txs,
    })
  ).safeTxHash;
}

export function isValidFunctionSelector(functionSelector: string): boolean {
  const fourByteHexRegex = /^0x[0-9a-fA-F]{8}$/;
  return fourByteHexRegex.test(functionSelector);
}

export async function setTxAllowed(
  contractAddress: string,
  functionSelector: string,
  amount: string | bigint,
  isAllowed: boolean,
  samm: BaseContract & Omit<ContractInterface, keyof BaseContract>,
  chainId: number
): Promise<string> {
  const setCallAllowanceCalldata = samm.interface.encodeFunctionData('setTxAllowed', [
    [contractAddress, functionSelector, amount],
    isAllowed,
  ]);

  let validationFunction;

  if (isAllowed) {
    validationFunction = async (): Promise<void> => {
      // Validate that new status is not the same
      const currentRestrictions = await getRestrictions(await samm.getAddress(), chainId);

      const index = currentRestrictions.findIndex(
        (val) => val.to === contractAddress && val.selector === functionSelector
      );

      if (index !== -1) {
        throw new Error('New status is the same as current in the module');
      }
    };
  } else {
    validationFunction = async (): Promise<void> => {
      const currentRestrictions = await getRestrictions(await samm.getAddress(), chainId);

      const index = currentRestrictions.findIndex(
        (val) => val.to === contractAddress && val.selector === functionSelector
      );

      if (index === -1) {
        throw new Error('No such restriction in a list');
      }
    };
  }

  return await sendSafeTxWithOptionalValidation(
    safeSDK,
    { to: await samm.getAddress(), data: setCallAllowanceCalldata, value: '0' },
    validationFunction
  );
}

export async function setAllowance(
  to: string,
  amount: string | bigint,
  samm: BaseContract & Omit<ContractInterface, keyof BaseContract>
): Promise<string> {
  const setAllowanceCalldata = samm.interface.encodeFunctionData('setAllowance', [to, amount]);

  const validationFunction = async (): Promise<void> => {
    // Validate that new amount is not the same
    const currentAllowance = await samm.allowance(to);
    if (currentAllowance === amount) {
      throw new Error('New amount is the same as current in the module');
    }
  };

  return await sendSafeTxWithOptionalValidation(
    safeSDK,
    { to: await samm.getAddress(), data: setAllowanceCalldata, value: '0' },
    validationFunction
  );
}

export async function setSAMMSettings(
  samm: BaseContract & Omit<ContractInterface, keyof BaseContract>,
  functionToCall: string,
  funcArg: string,
  currentValue: string
): Promise<string> {
  const data = samm.interface.encodeFunctionData(functionToCall, [funcArg]);

  const validationFunction = async (): Promise<void> => {
    if (currentValue.toString() === funcArg.toString()) {
      throw new Error('New value is the same as current in the module');
    }
  };

  return await sendSafeTxWithOptionalValidation(
    safeSDK,
    { to: await samm.getAddress(), data, value: '0' },
    validationFunction
  );
}

export async function getSAMMSettings(
  samm: BaseContract & Omit<ContractInterface, keyof BaseContract>,
  valueName: string
): Promise<string> {
  const functionName = `get${valueName}`;
  return await samm[functionName]();
}

export async function disableModule(sammAddress: string): Promise<string> {
  validateAddress(sammAddress, 'Module');

  const { safeAddress, modules } = await safeSDK.safe.getInfo();

  if (!modules || modules.length === 0) {
    throw new Error('No modules found');
  }

  const sammModuleIndex = modules.findIndex(
    (val) => sammAddress.toLowerCase() === val.toLowerCase()
  );

  if (sammModuleIndex === -1) {
    throw new Error('Module is not enabled');
  }

  const prevModule =
    sammModuleIndex === 0 ? SAMM_CONFIG.SENTINEL_MODULES : modules[sammModuleIndex - 1];

  const data = Interface.from([SAMM_CONFIG.DISABLE_MODULE_SIGNATURE]).encodeFunctionData(
    'disableModule',
    [prevModule, sammAddress]
  );

  return await sendSafeTxWithOptionalValidation(safeSDK, { to: safeAddress, data, value: '0' });
}

export interface SammSignatureResponseData {
  signature: string;
  messageHash: string;
  data: Data;
  chainId: number;
}

interface Data {
  signer: string;
  module: string;
  time: string;
}

export async function requestSignature(
  sammAddress: string,
  chainId: number,
  safeOwners: string[]
): Promise<SammSignatureResponseData> {
  // @ts-expect-error validation
  if (!window?.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  // @ts-expect-error Validated above
  const provider = new BrowserProvider(window.ethereum, chainId);

  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();

  if (safeOwners.findIndex((owner) => owner.toLowerCase() === signerAddress.toLowerCase()) === -1) {
    throw new Error('Signer is not an owner of the safe');
  }

  const block = await signer.provider.getBlock('latest');
  if (!block) {
    throw new Error('Failed to get latest block');
  }

  const domain = {
    name: 'SAMMAuthorizationRequest',
    version: SAMM_CONFIG.AUTHORIZATION_REQUEST_VERSION as string,
    chainId,
    verifyingContract: sammAddress.toLowerCase(),
  };

  const msgTypes = {
    SAMMAuthorizationRequest: [
      { name: 'signer', type: 'address' },
      { name: 'module', type: 'address' },
      { name: 'time', type: 'uint256' },
      // { name: 'message', type: 'string' },
    ],
  };

  const data = {
    signer: signerAddress.toLowerCase(),
    module: sammAddress.toLowerCase(),
    time: block.timestamp.toString(),
    // message: 'This signature authorizes the deployment of the SAMM module.',
  };

  const messageHash = TypedDataEncoder.hash(domain, msgTypes, data);
  const signature = await signer.signTypedData(domain, msgTypes, data);

  if (
    verifyTypedData(domain, msgTypes, data, signature).toLowerCase() !== signerAddress.toLowerCase()
  ) {
    throw new Error('Invalid signature');
  }

  return { messageHash, signature, data, chainId };
}

function getBrowserProvider(chainId: number) {
  // @ts-expect-error validation
  if (!window?.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  // @ts-expect-error Validated above
  return new BrowserProvider(window.ethereum, chainId);
}

export async function deployModuleByUser(data: ModuleFormData) {
  const proxyFactory = process.env.NEXT_PUBLIC_SAFE_PROXY_FACTORY_SEPOLIA as string;
  validateAddress(proxyFactory, 'Proxy Factory');

  const { safeAddress, chainId } = await safeSDK.safe.getInfo();
  const proxyFactoryInstance = getContractWithProvider(
    proxyFactory,
    JSON.stringify(SafeProxyFactoryABI),
    chainId
  );

  const salt = keccak256(
    AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint256'],
      [safeAddress, toBigInt(randomBytes(32))]
    )
  );

  const membersRoot = toBigInt(await fetchMembersRoot(data.emailAddresses.split(',')));

  const sammSetupCallData = Interface.from(SammABI).encodeFunctionData('setup', [
    safeAddress,
    membersRoot,
    data.threshold,
    data.relayerEmail,
    SAMM_CONFIG.DKIM_REGISTRY,
    [],
  ]);

  const createProxyPayload = proxyFactoryInstance.interface.encodeFunctionData(
    'createProxyWithNonce',
    [SAMM_CONFIG.SAMM_SINGLETON, sammSetupCallData, salt]
  );

  const provider = getBrowserProvider(chainId);

  const signer = await provider.getSigner();
  const txReceipt = await signer.sendTransaction({
    to: proxyFactory,
    data: createProxyPayload,
    chainId,
    from: await signer.getAddress(),
  });

  const tx = await txReceipt.wait(1);
  if (!tx?.status) {
    throw new Error('Module deploy transaction failed');
  }

  const deployedSammAddress = findSammDeployLog(tx.logs).toString();

  return { deployedSammAddress, chainId, safeAddress, membersRoot: membersRoot.toString() };
}

function findSammDeployLog(logs: readonly Log[]): AddressLike {
  const DEPLOY_EVENT_ID = '0x4f51faf6c4561ff95f067657e43439f0f856d97c04d9ec9070a6199ad418e235';

  if (!logs.length) {
    throw new Error('Empty logs, tx probably failed or incorrect tx hash is passed');
  }

  const logData = logs.find((log) => log.topics[0] === DEPLOY_EVENT_ID);

  if (!logData) {
    throw new Error('No deploy log found');
  }

  return AbiCoder.defaultAbiCoder().decode(['address'], logData.topics[1]).toString();
}

export async function enableModule(sammAddress: string): Promise<string> {
  const { safeAddress } = await safeSDK.safe.getInfo();

  const enableModulePayload = Interface.from([
    SAMM_CONFIG.ENABLE_MODULE_SIGNATURE,
  ]).encodeFunctionData('enableModule', [sammAddress]);

  // Execute the enable module transaction
  const txHash = await sendSafeTxWithOptionalValidation(safeSDK, {
    to: safeAddress,
    value: '0',
    data: enableModulePayload,
  });

  return txHash;
}

export async function getRestrictions(
  sammAddress: string,
  chainId: number
): Promise<Restriction[]> {
  try {
    const sammInstance = getContractWithProvider(sammAddress, JSON.stringify(SammABI), chainId);
    const res = await sammInstance.getAllowedTxs();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const restrictions: Restriction[] = res.map((item: any) => ({
      to: item[0],
      selector: item[1],
      allowance: BigInt(item[2]),
    }));

    return restrictions;
  } catch (error) {
    console.error('Error fetching restrictions:', error);
    throw new Error(`Failed to fetch restrictions: ${(error as Error).message}`);
  }
}

export async function updateMembersRoot(sammData: SAMMData | null, emails: string[]) {
  if (!sammData) throw new Error('No SAMM data');
  const samm = getSammWithProvider(sammData.samm_address, sammData.chain_id);
  const newMemberRoot = await fetchMembersRoot(emails);
  const currentRoot = sammData.root;
  await setSAMMSettings(samm, 'setMembersRoot', newMemberRoot, currentRoot);
}
