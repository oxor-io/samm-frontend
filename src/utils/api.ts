import { BASE_URL } from '@/app/api/config';
import { SammSignatureResponseData } from './safe';

import { Member } from '@/types/member';
import { SAMMData, SendingSAMMData } from '@/types/samm';
import { TokenResponse } from '@/types/token';
import { DBTransaction, DBTransactionApproval, DBTransactionStatus } from '@/types/transaction';

export async function fetchMembersRoot(members: string[]): Promise<string> {
  const url = `${BASE_URL}/members/root/`;
  const response = await fetchWithoutAuth<{ root: string }>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(members),
  });
  return response.root;
}

export async function getOwnerToken(
  signedData: SammSignatureResponseData,
  name?: string | null
): Promise<TokenResponse> {
  const url = `/api/auth`;
  const body: Record<string, string | number | boolean> = {
    isOwner: true,
    owner_address: signedData.data.signer,
    samm_address: signedData.data.module,
    chain_id: signedData.chainId,
    timestamp: signedData.data.time,
    signature: signedData.signature,
  };

  if (name) {
    body.name = name;
  }

  return await fetchWithoutAuth<TokenResponse>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getMemberToken(username: string, password: string): Promise<TokenResponse> {
  const url = `/api/auth`;
  const response = await fetchWithoutAuth<TokenResponse>(url, {
    method: 'POST',
    body: JSON.stringify({ isOwner: false, username, password }),
  });
  return response;
}

export async function getSAMMsBySafeAddress(
  safeAddress: string,
  chainId: number
): Promise<SAMMData[] | null> {
  const url = `${BASE_URL}/samms/?safe_address=${encodeURIComponent(safeAddress)}`;
  const allSAMMs = await fetchWithoutAuth<SAMMData[]>(url);
  return allSAMMs.filter((obj) => obj.chain_id === chainId) || null;
}

export async function deactivateSAMMModule(moduleId: string): Promise<boolean> {
  const url = `/api/samms?module_id=${moduleId}`;
  await fetchWithAuth(url, { method: 'DELETE' });
  return true;
}

export async function fetchMembers(sammId: number, offset = 0, limit = 100): Promise<Member[]> {
  const url = `/api/members?samm_id=${sammId}&offset=${offset}&limit=${limit}`;
  const allMembers = await fetchWithAuth<Member[]>(url);
  return allMembers.filter((member) => member.is_active === true);
}

export async function updateMembers(sammId: number, members: string[]): Promise<Member[]> {
  const url = `/api/members?samm_id=${sammId}`;
  const newMembers = await fetchWithAuth<Member[]>(url, {
    method: 'POST',
    body: JSON.stringify({ emailsList: members }),
  });
  return newMembers;
}

export async function getUserSAMMs(): Promise<SAMMData[]> {
  const url = `/api/samms`;
  const samms = await fetchWithAuth<SAMMData[]>(url);
  return samms;
}

export async function updateThreshold(
  sammId: number,
  threshold: number | string
): Promise<SAMMData> {
  const url = `/api/samms/update?samm_id=${sammId}&threshold=${threshold}`;
  const samm = await fetchWithAuth<SAMMData>(url, { method: 'PATCH' });
  return samm;
}

export async function fetchTransactions(
  sammId: number,
  status: DBTransactionStatus,
  offset = 0,
  limit = 100
): Promise<DBTransaction[]> {
  const url = `/api/transactions?sammId=${encodeURIComponent(sammId)}&status=${encodeURIComponent(
    status
  )}&offset=${offset}&limit=${limit}`;
  const transactions = await fetchWithAuth<DBTransaction[]>(url);
  return transactions;
}

export async function fetchAllTransactions(
  sammId: number,
  offset = 0,
  limit = 100
): Promise<DBTransaction[]> {
  const url = `/api/transactions?sammId=${encodeURIComponent(
    sammId
  )}&offset=${offset}&limit=${limit}`;
  const transactions = await fetchWithAuth<DBTransaction[]>(url);
  return transactions;
}

export async function fetchTransactionApprovals(
  transactionId: number,
  offset = 0,
  limit = 100
): Promise<DBTransactionApproval[]> {
  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }
  const url = `/api/transactions/approvals?transactionId=${transactionId}&offset=${offset}&limit=${limit}`;
  const approvals = await fetchWithAuth<DBTransactionApproval[]>(url);
  return approvals;
}

export async function fetchTransactionApprovalProof(
  transactionId: number
): Promise<DBTransactionApproval | null> {
  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }

  const url = `/api/transactions/approvals/me?transactionId=${transactionId}`;
  const response = await fetchWithAuth<DBTransactionApproval | null>(url);

  return response;
}

export async function createSAMM(sammData: SendingSAMMData): Promise<SAMMData> {
  try {
    const response = await fetch('/samms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sammData),
    });
    return (await response.json()) as SAMMData;
  } catch (error) {
    console.error('Failed to create SAMM:', error);
    throw error;
  }
}

export async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found. Please log in.');
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `${accessToken}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  let data: T;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Failed to parse server response: ${error}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid token');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorData = data as any;
    const errorMessage =
      errorData?.detail || errorData?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export async function fetchWithoutAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  let data: T;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Failed to parse server response: ${error}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid token');
    }
    const errorData = await response.json();
    const errorMessage =
      errorData?.detail || errorData?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  return data;
}
