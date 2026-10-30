import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#F8F4EC] flex items-center justify-center p-4 relative overflow-hidden text-[#29251F]">
      {/* Ambient warm background blurs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D97736]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#C58A32]/5 rounded-full blur-[140px] pointer-events-none" />
      {children}
    </div>
  );
}
