"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Sparkles, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";

export function MarketingNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8DFD1] bg-[#FFFCF6]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-2xs">
            F
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[#29251F]">FLOW</span>
              <Badge variant="outline" className="text-[9px] text-primary border-primary/30 bg-primary/5 py-0 px-1">
                OS
              </Badge>
            </div>
            <span className="text-[10px] text-[#777064] font-mono leading-none">Trust-First Agentic OS</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#777064]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors hover:text-[#29251F] ${
                  isActive ? "text-primary font-semibold" : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Auth CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5 text-xs font-semibold bg-primary hover:bg-[#B95727] text-white">
                <span>Dashboard ({user?.full_name?.split(" ")[0] || "Workspace"})</span>
                <ArrowRight size={13} />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs text-[#777064] hover:text-[#29251F] hover:bg-[#F1EADF]">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="gap-1.5 text-xs font-semibold bg-primary hover:bg-[#B95727] text-white shadow-2xs">
                  <span>Get Started</span>
                  <ArrowRight size={13} />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#777064] hover:text-[#29251F] rounded-lg hover:bg-[#F1EADF]"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[#E8DFD1] bg-[#FFFCF6] px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href ? "bg-[#FCEEE5] text-primary font-semibold" : "text-[#777064] hover:bg-[#F1EADF]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-2 border-t border-[#E8DFD1] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button className="w-full text-xs font-semibold bg-primary text-white">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full text-xs border-[#E8DFD1]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full text-xs font-semibold bg-primary text-white">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

