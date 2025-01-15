import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "zustand";
import { gameStateStore } from "../state";
import { useEffect, useRef } from "react";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import { isLookingAwayStore } from "../mediapipe";
import "@tensorflow/tfjs-backend-webgl";

export const Route = createFileRoute("/lockin")({
  component: LockInComponent,
  loader: () =>
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }),
});

function LockInComponent() {
  const stream = Route.useLoaderData();
  const gameState = useStore(gameStateStore);
  const code =
    gameState.stage === "requesting_code" ? undefined : gameState.code;

  return (
    <div className="flex flex-col w-full h-screen bg-[#FF5A5A] bg-[url('/background.png')] justify-between items-center py-8 w-full h-screen">
      <WebcamView stream={stream} />
      <div className="flex flex-col gap-y-4 items-center">
        <div className="text-2xl text-white">
          {gameState.stage === "locked_in"
            ? "Locked In"
            : gameState.stage === "requesting_code"
              ? "Requesting Code..."
              : "Waiting for Phone Connection..."}
        </div>
        <CodeDisplay code={code} />
        {import.meta.env.DEV && gameState.stage === "locked_in" ? (
          <button onClick={() => gameState.lookedAway()}> lookedAway </button>
        ) : null}
      </div>
    </div>
  );
}

function WebcamView({ stream }: { stream: MediaStream }) {
  // Define references
  const videoRef = useRef<HTMLVideoElement>(null);
  const gameState = useStore(gameStateStore, ({ stage }) => stage);

  // Detect function
  const detect = async (net: facemesh.FaceLandmarksDetector) => {
    if (
      typeof videoRef.current !== "undefined" &&
      videoRef.current !== null &&
      videoRef.current.readyState === 4
    ) {
      const landmarks = (await net.estimateFaces(videoRef.current))[0]
        .keypoints;

      const noseTip = landmarks[1];
      const leftNose = landmarks[279];
      const rightNose = landmarks[49];

      const midpoint = {
        x: (leftNose!.x + rightNose!.x) / 2,
        y: (leftNose!.y + rightNose!.y) / 2,
        z: (leftNose!.z! + rightNose!.z!) / 2,
      };

      // const zaxis = { x: noseTip.x, y: midpoint.y, z: noseTip.z };
      const xaxis = { x: midpoint.x + 1, y: midpoint.y, z: midpoint.z };

      const yaw = getAngleBetweenLines(midpoint, noseTip, xaxis);

      console.log({ yaw });

      if (Math.abs(yaw) < 32 || Math.abs(yaw) > 148) {
        // not looking at screen
        console.log("looking away");
        isLookingAwayStore.getState().lookAway();
      } else {
        console.log("looking at screen W");
        isLookingAwayStore.getState().lookAtScreen();
      }
    }
  };

  function getAngleBetweenLines(
    midpoint: { x: number; y: number },
    point1: { x: number; y: number },
    point2: { x: number; y: number },
  ) {
    // console.log("get angle between! points", midpoint, point1, point2);
    const v1 = { x: point1.x - midpoint.x, y: point1.y - midpoint.y };
    const v2 = { x: point2.x - midpoint.x, y: point2.y - midpoint.y };

    const dotProduct = v1.x * v2.x + v1.y * v2.y;

    const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    // Calculate the cosine of the angle between the two vectors
    const cosAng = dotProduct / (len1 * len2);

    // Use the arccosine function to get the angle in radians
    const angRad = Math.acos(cosAng);

    // Convert the angle to degrees
    const angDegrees = (angRad * 180) / Math.PI;

    return angDegrees;
  }

  useEffect(() => {
    const startWebcam = async () => {
      try {
        videoRef.current!.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startWebcam();

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const interval = (async () => {
      const net = await facemesh.createDetector(
        facemesh.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: "mediapipe",
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
        } as any,
      );
      return setInterval(() => detect(net), 333);
    })();

    return () => {
      interval.then((interval) => clearInterval(interval));
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className={`object-cover h-[80vh] aspect-video ${gameState === "locked_in" ? "border-4 border-white" : ""}`}
    />
  );
}

export default function CodeDisplay({ code }: { code: string | undefined }) {
  return (
    <div className="flex justify-center items-center w-36 h-24 bg-pink-200 rounded-lg shadow-md">
      {code === undefined ? (
        <CodeSkeleton />
      ) : (
        <span className="text-4xl font-bold tracking-wider">{code}</span>
      )}
    </div>
  );
}

function CodeSkeleton() {
  return (
    <div className="flex space-x-2">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="w-8 h-12 bg-pink-300 rounded animate-pulse"
        />
      ))}
    </div>
  );
}
