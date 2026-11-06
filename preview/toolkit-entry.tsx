// Standalone preview of the Financial Reset Toolkit (hash-routed already), for sharing as a single static page.
import { createRoot } from "react-dom/client";
import { ToolkitApp } from "@/components/toolkit/app";

// No server in the preview: links back to the main website open the shareable website preview instead.
const SITE_PREVIEW = "https://claude.ai/artifact/FcPhwYTL8oZYAYDF4Jwq13";
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest?.("a");
  const href = a?.getAttribute("href");
  if (!a || !href || !href.startsWith("/")) return;
  e.preventDefault();
  window.open(SITE_PREVIEW, "_blank", "noopener");
});

createRoot(document.getElementById("root")!).render(<ToolkitApp />);
