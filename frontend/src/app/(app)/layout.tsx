import React from "react";
import Header from "@/components/layout/Header";

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}

export default layout;
