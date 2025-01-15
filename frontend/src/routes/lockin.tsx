import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "zustand";
import { gameStateStore } from "../state";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { onResults, useIsLookingAway } from "../mediapipe";

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
    <div className="flex flex-col justify-between items-center py-16 w-full h-screen">
      <WebcamView stream={stream} />
      <div className="flex flex-col gap-y-4">
        <div>stage: {gameState.stage}</div>
        <div className="text-6xl">{code}</div>
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
      className="object-cover w-[80%] aspect-video"
    />
  );
}
