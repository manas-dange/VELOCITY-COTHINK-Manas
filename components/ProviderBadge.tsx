import React from "react";

export function ProviderBadge({ provider }: { provider?: string }) {
  return <div>Provider: {provider || "Mock"}</div>;
}
