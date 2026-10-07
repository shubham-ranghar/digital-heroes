import type { Metadata } from "next";

import { DesignPreviewContent } from "@/app/design-preview/design-preview-content";

export const metadata: Metadata = {
  title: "Design preview",
};

export default function DesignPreviewPage() {
  return <DesignPreviewContent />;
}
