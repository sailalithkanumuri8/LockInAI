import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full h-screen bg-[#FF5A5A] bg-[url('/background.png')] items-center flex flex-col pt-32">
      <img src="/logo.png" alt="LockIn Logo" className="w-64 h-64" />
      <h1 className="text-6xl text-center text-white">
        <Link to="/lockin" className="flex flex-row pt-8">
          Lock In Now <RightArrow />
        </Link>
      </h1>
      <p className="pt-4 text-2xl text-white">
        Made by Rohan Godha, Sai Lalith Kanumuri, Satvik Marripalapu, Shreyas
        Sakharkar
      </p>
    </div>
  );
}

function RightArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="72"
      height="72"
      viewBox="0 -960 960 960"
      className="stroke-white fill-white"
    >
      <path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240z" />
    </svg>
  );
}
