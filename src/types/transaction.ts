export type DBTransactionStatus = 'pending' | 'confirmed' | 'success' | 'failed';

export interface DBTransaction {
  msg_hash: string;
  to: string;
  value: number;
  data: string;
  operation: string;
  nonce: number;
  deadline: number;
  samm_id: number;
  status: DBTransactionStatus;
  created_at: string;
  id: number;
}

export interface DBTransactionApproval {
  txn_id: number;
  proof: string;
  commit: string;
  domain: string;
  pubkey_hash: string;
  is_2048_sig: boolean;
  created_at: string;
  id: number;
}
