import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/professor/submissions")({
  component: Page,
});

function Page() {
  return <Outlet />;
}
