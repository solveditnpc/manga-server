import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default layout;
