import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import init, { verify_proof } from "swiftness-starknet-with-keccak-blake2s";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import { Button, ButtonPropsColorOverrides, colors } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [programHash, setProgramHash] = useState<string>("");
  const [outputHash, setOutputHash] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [proof, setProof] = useState<string | ArrayBuffer | null>(null);
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

  useEffect(() => {
    const initializeWasm = async () => {
      try {
        await init();
      } catch (err) {
        console.error("Failed to initialize WebAssembly module:", err);
      }
    };

    initializeWasm();
  }, []);

  const ondrop = <T extends File>(
    acceptedFiles: T[],
    _fileRejections: FileRejection[],
    _event: DropEvent,
  ) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      if (e.target && e.target.result) {
        setProof(e.target.result);
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
                const [programHash, programOutput] = JSON.parse(
                  verify_proof(proof),
                );
                setProgramHash(programHash);
                setOutputHash(programOutput);
                setButton("correct proof");
                setButtonColor("success");
              } catch (err) {
                console.error(`Verification failed: ${err}`);
                setProgramHash("");
                setOutputHash("");
                setButton("invalid proof");
                setButtonColor("error");
              }
            }}
          >
            {button}
          </Button>
          <div className="grid gap-1 grid-cols-[auto_1fr]">
            <div className="col-start-1 col-end-2 row-start-1 row-end-2 overflow-hidden">
              program hash
            </div>
            <div className="col-start-2 col-end-3 row-start-1 row-end-2 overflow-hidden">
              {programHash}
            </div>
            <div className="col-start-1 col-end-2 row-start-2 row-end-3 overflow-hidden">
              output hash
            </div>
            <div className="col-start-2 col-end-3 row-start-2 row-end-3 overflow-hidden">
              {outputHash}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
