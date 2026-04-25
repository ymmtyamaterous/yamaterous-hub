import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@better-t-app/ui/components/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

const scItem: React.CSSProperties = {
  fontFamily: "var(--sc-font-mono)",
  fontSize: "12px",
  letterSpacing: "0.08em",
  color: "var(--sc-muted)",
  cursor: "pointer",
};

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div
        style={{
          width: "80px",
          height: "28px",
          background: "rgba(200,0,90,0.08)",
          borderRadius: "2px",
          border: "1px solid rgba(200,0,90,0.15)",
        }}
      />
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              letterSpacing: "0.08em",
              fontWeight: 600,
              color: "var(--sc-muted)",
              background: "transparent",
              border: "1px solid rgba(200,0,90,0.25)",
              borderRadius: "2px",
              padding: "0.3rem 0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
            className="hover:!border-[var(--sc-sakura)] hover:!text-[var(--sc-sakura)] dark:!border-pink-900/40 dark:!text-neutral-400"
          />
        }
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "var(--sc-sakura)",
            boxShadow: "0 0 5px var(--sc-sakura)",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        {session.user.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        style={{
          background: "rgba(253,246,239,0.97)",
          border: "1px solid rgba(200,0,90,0.18)",
          borderRadius: "4px",
          boxShadow: "0 4px 20px rgba(200,0,90,0.1)",
          minWidth: "180px",
        }}
        className="dark:!bg-neutral-900/97 dark:!border-pink-900/25"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              color: "var(--sc-cyber)",
              textTransform: "uppercase",
            }}
          >
            // ACCOUNT
          </DropdownMenuLabel>
          <DropdownMenuSeparator style={{ background: "rgba(200,0,90,0.1)" }} />
          <DropdownMenuItem
            style={{ ...scItem, fontSize: "11px", opacity: 0.6, cursor: "default" }}
          >
            {session.user.email}
          </DropdownMenuItem>
          <DropdownMenuItem
            style={scItem}
            className="hover:!text-[var(--sc-sakura)] hover:!bg-[var(--sc-surface)]"
            onClick={() => navigate({ to: "/admin" })}
          >
            管理画面
          </DropdownMenuItem>
          <DropdownMenuSeparator style={{ background: "rgba(200,0,90,0.1)" }} />
          <DropdownMenuItem
            style={{ ...scItem, color: "var(--sc-cyber3)" }}
            className="hover:!bg-red-50 dark:hover:!bg-red-900/20"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({ to: "/" });
                  },
                },
              });
            }}
          >
            サインアウト
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
