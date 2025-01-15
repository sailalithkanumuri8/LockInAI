import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "zustand";
import { gameStateStore } from "../state";
import { useEffect, useMemo, useRef } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { onResults } from "../mediapipe";

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
        <div className="text-white text-2xl">{gameState.stage === "locked_in" ? "Locked In" : gameState.stage === "requesting_code" ? "Requesting Code..." : "Waiting for Phone Connection..."}</div>
        <CodeDisplay code={code} />
        {gameState.stage === "locked_in" ? (
          <button onClick={() => gameState.lookedAway()}> lookedAway </button>
        ) : null}
      </div>
    </div>
  );
}

function WebcamView({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceDetection = useMemo(() => {
    const faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.1646425229/${file}`,
    });
    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.5,
    });
    faceDetection.onResults(onResults);
    return faceDetection;
  }, []);

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
    const interval = setInterval(() => {
      faceDetection.send({
        image: videoRef.current!,
      });
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="object-cover h-[80vh] aspect-video"
    />
  );
}

export default function CodeDisplay({ code }: { code: string | undefined }) {
  return (
    <div className="w-36 h-24 bg-pink-200 rounded-lg shadow-md flex items-center justify-center">
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
