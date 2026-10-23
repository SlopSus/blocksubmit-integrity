import { createFileRoute } from "@tanstack/react-router";
import { VerificationPage } from "@/pages/verification";

export interface VerificationSearch {
  id?: string | undefined;
}

export const Route = createFileRoute("/professor/verification")({
  validateSearch: (search: Record<string, unknown>): VerificationSearch => {
    const rawId = search["id"];
    return {
      id: typeof rawId === "string" && rawId.trim() ? rawId.trim() : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Document verification — BlockSubmit" },
      { name: "description", content: "Compare trusted and current document hashes." },
      { property: "og:title", content: "Document verification — BlockSubmit" },
      { property: "og:description", content: "Compare trusted and current document hashes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useSearch();
  return <VerificationPage targetId={id} />;
}
