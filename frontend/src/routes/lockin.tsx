import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "zustand";
import { gameStateStore } from "../state";
import { useEffect, useRef } from "react";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import { isLookingAwayStore } from "../mediapipe";

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
  
  // Define references
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect function
  const detect = async (net:any) => {
    if (typeof videoRef.current !== "undefined" && videoRef.current !== null && videoRef.current.readyState === 4) {

      const face = await net.estimateFaces({input:videoRef});
      const landmarks: any[] = face.scaledMesh;
      
      let noseTip: any, leftNose: any, rightNose: any;
      try {
        noseTip = { ...landmarks[1], name: "nose tip" };
        leftNose = { ...landmarks[279], name: "left nose" };
        rightNose = { ...landmarks[49], name: "right nose" };
      } catch (error) {
        console.log("error creating directional points", landmarks, error);
      }

      const midpoint = {
        x: (leftNose!.x + rightNose!.x) / 2,
        y: (leftNose!.y + rightNose!.y) / 2,
        z: (leftNose!.z + rightNose!.z) / 2,
      };

      const zaxis = { x: noseTip.x, y: midpoint.y, z:  noseTip.z };
      const xaxis = { x: midpoint.x+1, y: midpoint.y, z: midpoint.z };
    
      const yaw = getAngleBetweenLines(midpoint, noseTip, xaxis);
      const pitch = getAngleBetweenLines(midpoint, noseTip, zaxis);

      console.log([yaw, pitch]);

      if (Math.abs(yaw) < 30 || Math.abs(yaw) > 150 || Math.abs(pitch) > 60) { // not looking at screen
        console.log("looking away");
        isLookingAwayStore.getState().lookAway();
      } else {
        console.log("looking at screen W");
        isLookingAwayStore.getState().lookAtScreen();
      }
    }
  }

  function getAngleBetweenLines(midpoint:any, point1:any, point2:any) {
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

  // Load facemesh
  const runFacemesh = async () => {
    const net = await facemesh.load(facemesh.SupportedPackages.mediapipeFacemesh);
    setInterval(() => {
      detect(net);
    }, 3000);
  };

  useEffect(()=>{runFacemesh()}, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="object-cover w-[80%] aspect-video"
    />
  );
}