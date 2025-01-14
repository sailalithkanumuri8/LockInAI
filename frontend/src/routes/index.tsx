import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      welcome to lockin ai.
      <Link to="/lockin"> click here to lockin</Link>
    </div>
  );
}
