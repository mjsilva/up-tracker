"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { startCase } from "lodash";

export function Title() {
  const pathname = usePathname();
  let title = pathname.split("/")?.[0];
  if (!title) {
    title = pathname;
  }
  return (
    <div>
      {title ? (
        <h1 className="text-2xl font-semibold">{startCase(title)}</h1>
      ) : null}
    </div>
  );
}
