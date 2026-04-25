import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@better-t-app/ui/components/dropdown-menu";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

const scDropdownItem: React.CSSProperties = {
  fontFamily: "var(--sc-font-mono)",
  fontSize: "12px",
  letterSpacing: "0.08em",
  color: "var(--sc-muted)",
  cursor: "pointer",
};

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              border: "1px solid rgba(200,0,90,0.25)",
              borderRadius: "2px",
              background: "transparent",
              color: "var(--sc-muted)",
              cursor: "pointer",
              position: "relative",
              transition: "border-color 0.2s, color 0.2s",
            }}
            className="hover:!border-[var(--sc-sakura)] hover:!text-[var(--sc-sakura)] dark:!border-pink-900/40"
          />
        }
      >
        <Sun className="h-[1rem] w-[1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1rem] w-[1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        style={{
          background: "rgba(253,246,239,0.97)",
          border: "1px solid rgba(200,0,90,0.18)",
          borderRadius: "4px",
          boxShadow: "0 4px 20px rgba(200,0,90,0.1)",
          minWidth: "120px",
        }}
        className="dark:!bg-neutral-900/97 dark:!border-pink-900/25"
      >
        <DropdownMenuItem style={scDropdownItem} onClick={() => setTheme("light")}
          className="hover:!text-[var(--sc-sakura)] hover:!bg-[var(--sc-surface)]"
        >Light</DropdownMenuItem>
        <DropdownMenuItem style={scDropdownItem} onClick={() => setTheme("dark")}
          className="hover:!text-[var(--sc-sakura)] hover:!bg-[var(--sc-surface)]"
        >Dark</DropdownMenuItem>
        <DropdownMenuItem style={scDropdownItem} onClick={() => setTheme("system")}
          className="hover:!text-[var(--sc-sakura)] hover:!bg-[var(--sc-surface)]"
        >System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
