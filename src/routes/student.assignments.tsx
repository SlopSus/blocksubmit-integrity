import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/student/assignments")({
  component: Page,
});

function Page() {
  return <Outlet />;
}
