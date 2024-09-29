import { useEffect, useRef, useState } from "react";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import { RiNpmjsFill } from "react-icons/ri";
import { FaGithub } from "react-icons/fa";
import { Box, Button, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { WorkerMessage, WorkerResponse } from "@/utils/types";
import { matchCommitment, matchLayout, Stone } from "swiftness";

function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

export default function Home() {
  const [programHash, setProgramHash] = useState<string>("");
  const [outputHash, setOutputHash] = useState<string>("");
  const [layout, setLayout] = useState<string>("");
  const [commitment, setCommitment] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [proof, setProof] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState<string>("verify proof");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verificationStarted, setVerificationStarted] = useState(false);
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
        console.log(file.size);
        setFileSize(file.size);
      }
    };

    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: ondrop,
  });

  const workerRef = useRef<Worker>();

  const verifyProof = async (proof: string) => {
    const parsedProof = JSON.parse(proof);

    const layout = matchLayout(parsedProof.public_input.layout);
    const commitment = matchCommitment(parsedProof.proof_parameters.commitment_hash);
    const stone = Stone.STONE6;

    workerRef.current = new Worker(new URL("../worker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { programHash, outputHash, error } = event.data;

      if (error) {
        console.error(error);
        setButtonText("Verification Failed");
        setButtonColor("error");
      } else {
        setProgramHash(programHash ?? "");
        setOutputHash(outputHash ?? "");
        setLayout(layout ?? "");
        setCommitment(commitment ?? "");
        setButtonText("Proof Verified");
        setButtonColor("success");
      }

      setVerificationStarted(false);
      workerRef.current?.terminate();
    };

    if (layout && commitment && stone) {
      const message: WorkerMessage = {
        proof,
        layout,
        commitment,
        stone,
      };

      workerRef.current.postMessage(message);
    }
  };

  useEffect(() => {
    if (verificationStarted) {
      if (proof) {
        verifyProof(proof);
      } else {
        setButtonText("Proof not present");
        setButtonColor("warning");
        setVerificationStarted(false);
      }
    }
  }, [verificationStarted, proof]);

  const handleClick = () => {
    // Initial state updates
    setProgramHash("");
    setOutputHash("");
    setLayout("");
    setCommitment("");
    setButtonText("Verifying Proof...");
    setButtonColor("info");
    setVerificationStarted(true);
  };

  return (
    <main>
      <div className="h-screen grid justify-center items-center">
        <div className="grid grid-flow-row gap-4 p-10 w-screen max-w-[800px]">
          <div className="text-2xl p-2 text-center grid grid-flow-col grid-cols-[60px_1fr_60px] justify-center items-center">
            <div></div>
            <div>cairo-vm verifier</div>
            <div className="grid grid-flow-col gap-0 justify-around items-center">
              <a
                className="cursor-pointer"
                target="_blank"
                href="https://www.npmjs.com/search?q=swiftness"
              >
                <RiNpmjsFill />
              </a>
              <a
                className="cursor-pointer"
                target="_blank"
                href="https://github.com/iosis-tech/swiftness"
              >
                <FaGithub />
              </a>
            </div>
          </div>
          <div
            className="cursor-pointer p-10 border-2 rounded-2xl border-dashed border-gray-800 hover:bg"
            {...getRootProps()}
          >
            <input className="w-full" {...getInputProps()} />
            {proof != null && fileName != null && fileSize != null ? (
              <p className="text-center">
                {fileName} - {humanFileSize(fileSize)}
              </p>
            ) : isDragActive ? (
              <p className="text-center">Drop the Trace here ...</p>
            ) : (
              <p className="text-center">
                Drag Proof json here, or click to select files
              </p>
            )}
          </div>
          <Button
            sx={{
              color: "#F2A900",
              borderColor: "#473200",
              height: 50,
              "&:hover": {
                borderColor: "#634500",
              },
            }}
            variant="outlined"
            size="small"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              let proof = await (
                await fetch("cairo0_stone6_example_proof.json")
              ).text();
              setFileName("cairo0_stone6_example_proof.json");
              setProof(proof);
              const blob = new Blob([proof], { type: "text/plain" });
              const fileSize = blob.size;
              setFileSize(fileSize);
              setIsLoading(false);
            }}
          >
            {isLoading ? (
              <CircularProgress
                size={24}
                sx={{ color: "#F2A900", animationDuration: "700ms" }}
              />
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="body2">load dynamic layout proof</Typography>
              </Box>
            )}
          </Button>
          <Button
            sx={{ height: 50 }}
            variant="outlined"
            size="large"
            color={buttonColor}
            onClick={handleClick}
            disabled={verificationStarted}
          >
            {verificationStarted ? (
              <CircularProgress size={24} sx={{ animationDuration: "700ms" }} />
            ) : (
              buttonText
            )}
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
