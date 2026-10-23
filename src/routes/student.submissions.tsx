import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/student/submissions")({
  component: Page,
});

function Page() {
  return <Outlet />;
}
