export interface MessageBody {
  to: string;
  value: number | bigint | string;
  data: string;
  operation: 'CALL' | 'DELEGATECALL';
  nonce: number | bigint;
  deadline: number;
}

export interface Message {
  msgHash: string;
  calldata: MessageBody;
}
