import { Inter } from "next/font/google";
import { useState } from "react";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import { Button } from "@mui/material";
import init_swiftness_dex_blake2s, {
  verify_proof as verify_proof_swiftness_dex_blake2s,
} from "swiftness-dex-blake2s";
import init_swiftness_dex_keccak, {
  verify_proof as verify_proof_swiftness_dex_keccak,
} from "swiftness-dex-keccak";
import init_swiftness_recursive_blake2s, {
  verify_proof as verify_proof_swiftness_recursive_blake2s,
} from "swiftness-recursive-blake2s";
import init_swiftness_recursive_keccak, {
  verify_proof as verify_proof_swiftness_recursive_keccak,
} from "swiftness-recursive-keccak";
import init_swiftness_recursive_with_poseidon_blake2s, {
  verify_proof as verify_proof_swiftness_recursive_with_poseidon_blake2s,
} from "swiftness-recursive-with-poseidon-blake2s";
import init_swiftness_recursive_with_poseidon_keccak, {
  verify_proof as verify_proof_swiftness_recursive_with_poseidon_keccak,
} from "swiftness-recursive-with-poseidon-keccak";
import init_swiftness_small_blake2s, {
  verify_proof as verify_proof_swiftness_small_blake2s,
} from "swiftness-small-blake2s";
import init_swiftness_small_keccak, {
  verify_proof as verify_proof_swiftness_small_keccak,
} from "swiftness-small-keccak";
import init_swiftness_starknet_blake2s, {
  verify_proof as verify_proof_swiftness_starknet_blake2s,
} from "swiftness-starknet-blake2s";
import init_swiftness_starknet_keccak, {
  verify_proof as verify_proof_swiftness_starknet_keccak,
} from "swiftness-starknet-keccak";
import init_swiftness_starknet_with_keccak_blake2s, {
  verify_proof as verify_proof_swiftness_starknet_with_keccak_blake2s,
} from "swiftness-starknet-with-keccak-blake2s";
import init_swiftness_starknet_with_keccak_keccak, {
  verify_proof as verify_proof_swiftness_starknet_with_keccak_keccak,
} from "swiftness-starknet-with-keccak-keccak";

const inter = Inter({ subsets: ["latin"] });

enum Layout {
  DEX = "dex",
  RECURSIVE = "recursive",
  RECURSIVE_WITH_POSEIDON = "recursive_with_poseidon",
  SMALL = "small",
  STARKNET = "starknet",
  STARKNET_WITH_KECCAK = "starknet_with_keccak",
}

const matchLayout = (layout: string): Layout | undefined => {
  switch (layout) {
    case Layout.DEX:
      return Layout.DEX;
    case Layout.RECURSIVE:
      return Layout.RECURSIVE;
    case Layout.RECURSIVE_WITH_POSEIDON:
      return Layout.RECURSIVE_WITH_POSEIDON;
    case Layout.SMALL:
      return Layout.SMALL;
    case Layout.STARKNET:
      return Layout.STARKNET;
    case Layout.STARKNET_WITH_KECCAK:
      return Layout.STARKNET_WITH_KECCAK;
    default:
      return undefined;
  }
};
enum Commitment {
  BLAKE2S = "blake256",
  KECCAK = "keccak256",
}

const matchCommitment = (commitment: string): Commitment | undefined => {
  switch (commitment) {
    case Commitment.BLAKE2S:
      return Commitment.BLAKE2S;
    case Commitment.KECCAK:
      return Commitment.KECCAK;
    default:
      return undefined;
  }
};

type VerifierFunctionTuple = [() => Promise<any>, (...args: any[]) => string];
type VerifierMap = {
  [key in `${Layout}_${Commitment}`]?: VerifierFunctionTuple;
};

const verifier_map: VerifierMap = {
  [`${Layout.DEX}_${Commitment.BLAKE2S}`]: [
    init_swiftness_dex_blake2s,
    verify_proof_swiftness_dex_blake2s,
  ],
  [`${Layout.DEX}_${Commitment.KECCAK}`]: [
    init_swiftness_dex_keccak,
    verify_proof_swiftness_dex_keccak,
  ],
  [`${Layout.RECURSIVE}_${Commitment.BLAKE2S}`]: [
    init_swiftness_recursive_blake2s,
    verify_proof_swiftness_recursive_blake2s,
  ],
  [`${Layout.RECURSIVE}_${Commitment.KECCAK}`]: [
    init_swiftness_recursive_keccak,
    verify_proof_swiftness_recursive_keccak,
  ],
  [`${Layout.RECURSIVE_WITH_POSEIDON}_${Commitment.BLAKE2S}`]: [
    init_swiftness_recursive_with_poseidon_blake2s,
    verify_proof_swiftness_recursive_with_poseidon_blake2s,
  ],
  [`${Layout.RECURSIVE_WITH_POSEIDON}_${Commitment.KECCAK}`]: [
    init_swiftness_recursive_with_poseidon_keccak,
    verify_proof_swiftness_recursive_with_poseidon_keccak,
  ],
  [`${Layout.SMALL}_${Commitment.BLAKE2S}`]: [
    init_swiftness_small_blake2s,
    verify_proof_swiftness_small_blake2s,
  ],
  [`${Layout.SMALL}_${Commitment.KECCAK}`]: [
    init_swiftness_small_keccak,
    verify_proof_swiftness_small_keccak,
  ],
  [`${Layout.STARKNET}_${Commitment.BLAKE2S}`]: [
    init_swiftness_starknet_blake2s,
    verify_proof_swiftness_starknet_blake2s,
  ],
  [`${Layout.STARKNET}_${Commitment.KECCAK}`]: [
    init_swiftness_starknet_keccak,
    verify_proof_swiftness_starknet_keccak,
  ],
  [`${Layout.STARKNET_WITH_KECCAK}_${Commitment.BLAKE2S}`]: [
    init_swiftness_starknet_with_keccak_blake2s,
    verify_proof_swiftness_starknet_with_keccak_blake2s,
  ],
  [`${Layout.STARKNET_WITH_KECCAK}_${Commitment.KECCAK}`]: [
    init_swiftness_starknet_with_keccak_keccak,
    verify_proof_swiftness_starknet_with_keccak_keccak,
  ],
};

// Function to dynamically import the required swiftness package
async function loadSwiftnessModule(layout: Layout, commitment: Commitment) {
  const key = `${layout}_${commitment}` as keyof VerifierMap;
  if (verifier_map[key]) {
    const [init, verify] = verifier_map[key]!;
    await init();
    return verify;
  } else {
    throw new Error("Invalid layout or commitment type");
  }
}

export default function Home() {
  const [programHash, setProgramHash] = useState<string>("");
  const [outputHash, setOutputHash] = useState<string>("");
  const [layout, setLayout] = useState<string>("");
  const [commitment, setCommitment] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [proof, setProof] = useState<string | null>(null);
  const [button, setButton] = useState<string>("verify proof");
  const [buttonColor, setButtonColor] = useState<
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
  >("info");

  const ondrop = <T extends File>(
    acceptedFiles: T[],
    _fileRejections: FileRejection[],
    _event: DropEvent,
  ) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      if (e.target && e.target.result) {
        setProof(e.target.result as string);
        setFileName(file.name);
      }
    };

    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: ondrop,
  });

  return (
    <main>
      <div className="h-screen grid justify-center items-center">
        <div className="grid grid-flow-row gap-4 p-10 w-screen max-w-[800px]">
          <div className="text-2xl p-2 text-center">CairoVM Verifier</div>
          <div
            className="cursor-pointer p-10 border-2 rounded-2xl border-dashed border-gray-800 hover:bg"
            {...getRootProps()}
          >
            <input className="w-full" {...getInputProps()} />
            {proof != null ? (
              <p className="text-center">{fileName}</p>
            ) : isDragActive ? (
              <p className="text-center">Drop the Trace here ...</p>
            ) : (
              <p className="text-center">
                Drag Proof json here, or click to select files
              </p>
            )}
          </div>
          <Button
            variant="text"
            size="small"
            onClick={async () => {
              let proof = await (await fetch("proof.json")).text();
              setFileName("8M steps starknet_with_keccak proof.json");
              setProof(proof);
            }}
          >
            load example proof
          </Button>
          <Button
            variant="outlined"
            size="large"
            color={buttonColor}
            onClick={async () => {
              try {
                if (proof != null) {
                  let proof_json = JSON.parse(proof);
                  let layout = matchLayout(
                    proof_json["public_input"]["layout"],
                  );
                  let commitment = matchCommitment(
                    proof_json["proof_parameters"]["pow_hash"],
                  );
                  if (layout && commitment) {
                    let verify_proof = await loadSwiftnessModule(
                      layout,
                      commitment,
                    );
                    const [programHash, programOutput] = JSON.parse(
                      verify_proof(proof),
                    );
                    setProgramHash(programHash);
                    setOutputHash(programOutput);
                    setLayout(layout);
                    setCommitment(commitment);
                    setButton("correct proof");
                    setButtonColor("success");
                  }
                }
              } catch (err) {
                console.error(`Verification failed: ${err}`);
                setProgramHash("");
                setOutputHash("");
                setLayout("");
                setCommitment("");
                setButton("invalid proof");
                setButtonColor("error");
              }
            }}
          >
            {button}
          </Button>
          <div className="grid gap-1 grid-cols-[auto_1fr]">
            <div className="col-start-1 col-end-2 row-start-1 row-end-2 overflow-hidden">
              layout:
            </div>
            <div className="col-start-2 col-end-3 row-start-1 row-end-2 overflow-hidden">
              {layout}
            </div>
            <div className="col-start-1 col-end-2 row-start-2 row-end-3 overflow-hidden">
              commitment:
            </div>
            <div className="col-start-2 col-end-3 row-start-2 row-end-3 overflow-hidden">
              {commitment}
            </div>
            <div className="col-start-1 col-end-2 row-start-3 row-end-4 overflow-hidden">
              program hash:
            </div>
            <div className="col-start-2 col-end-3 row-start-3 row-end-4 overflow-hidden">
              {programHash}
            </div>
            <div className="col-start-1 col-end-2 row-start-4 row-end-5 overflow-hidden">
              output hash:
            </div>
            <div className="col-start-2 col-end-3 row-start-4 row-end-5 overflow-hidden">
              {outputHash}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
