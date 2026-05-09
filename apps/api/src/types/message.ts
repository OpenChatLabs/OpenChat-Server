export type MessagePayload = {
  uid: string;
  from: string;
  to: string;
  timestamp: number;
  content: string;
}

export type MessageSignature = {
  signature: string;
}