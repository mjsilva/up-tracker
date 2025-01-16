import React, { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  return <main className="p-6">{children}</main>;
}
