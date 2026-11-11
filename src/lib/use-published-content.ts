"use client";

import * as React from "react";

export function usePublishedContent<T>(path: string, initialContent: T[]) {
  const [content, setContent] = React.useState(initialContent);

  React.useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(path, { cache: "no-store", signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Content request failed (${response.status})`);
          return response.json() as Promise<Record<string, unknown>>;
        })
        .then((data) => {
          const key = path.endsWith("/projects") ? "projects" : "certificates";
          const items = data[key];
          if (!Array.isArray(items)) throw new Error("Content response is invalid");
          setContent(items as T[]);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          console.error("Unable to refresh published portfolio content:", error);
        });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [path]);

  return content;
}
