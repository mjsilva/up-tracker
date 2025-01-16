import React, { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <main className="flex flex-1 justify-center overflow-y-auto p-6">
        <div className={"w-full max-w-screen-xl"}>{children}</div>
      </main>
    </>
  );
}
