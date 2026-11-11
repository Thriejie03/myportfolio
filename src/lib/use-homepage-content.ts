"use client";

import * as React from "react";
import { defaultHomepageContent, type HomepageContent } from "@/data/homepage";

export function useHomepageContent() {
  const [content, setContent] = React.useState<HomepageContent>(defaultHomepageContent);

  React.useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch("/api/content/homepage", { cache: "no-store", signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Homepage content request failed (${response.status})`);
          return response.json() as Promise<{ content?: HomepageContent }>;
        })
        .then((data) => {
          if (!data.content) throw new Error("Homepage content response is invalid.");
          setContent(data.content);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          console.error("Unable to refresh homepage content:", error);
        });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return content;
}
