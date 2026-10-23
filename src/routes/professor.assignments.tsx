import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/professor/assignments")({
  component: Page,
});

function Page() {
  return <Outlet />;
}
