import { loadSwiftnessModule } from "swiftness";
import type { WorkerMessage, WorkerResponse } from "./utils/types";

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { proof, layout, commitment, stone } = event.data;

  try {
    // Load the module and verify the proof
    let [parse_proof, verify_proof] = await loadSwiftnessModule(layout, commitment, stone);
    const output = JSON.parse(verify_proof(parse_proof(proof)));

    // Send results back to the main thread
    const response: WorkerResponse = { programHash: output['program_hash'], outputHash: output['output_hash'] };
    self.postMessage(response);
  } catch (error) {
    // Send error back to the main thread
    const response: WorkerResponse = { error: (error as Error).message };
    self.postMessage(response);
  }
};
