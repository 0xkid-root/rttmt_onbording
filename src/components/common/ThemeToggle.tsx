"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("rttmt_theme") || localStorage.getItem("rtmt_theme")) as "light" | "dark" | null;
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("rttmt_theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <Button
        id="rttmt-theme-toggle"
        variant="ghost"
        size="icon"
        className={`size-8 text-muted-foreground hover:text-foreground ${className || ""}`}
        aria-label="Toggle theme"
      >
        <Sun className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      id="rttmt-theme-toggle"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`size-8 text-muted-foreground hover:text-foreground transition-colors ${className || ""}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="size-4 text-foreground transition-transform hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-foreground transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}
