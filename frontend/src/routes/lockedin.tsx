import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/lockedin")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/lockedin"!</div>;
}
