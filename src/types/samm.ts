export interface SAMMData {
  id: number;
  root: string;
  name: string;
  nonce: number;
  chain_id: number;
  threshold: number;
  is_active: boolean;
  safe_address: string;
  samm_address: string;
  expiration_period: number;
}

export interface SendingSAMMData {
  root: string;
  chain_id: number;
  threshold: number;
  samm_address: string;
  safe_address: string;
  expiration_period: number;
}
