import { Commitment, Layout, Stone } from "swiftness";

export interface WorkerMessage {
  proof: string;
  layout: Layout;
  commitment: Commitment;
  stone: Stone
}

export interface WorkerResponse {
  programHash?: string;
  outputHash?: string;
  error?: string;
}
