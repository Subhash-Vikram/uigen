"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { MainContent as MainContentType } from "./main-content";

const MainContent = dynamic(
  () => import("./main-content").then((m) => ({ default: m.MainContent })),
  { ssr: false }
);

export function ClientMainContent(props: ComponentProps<typeof MainContentType>) {
  return <MainContent {...props} />;
}
