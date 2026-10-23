import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LogOut,
  MonitorCog,
  RefreshCw,
  Server,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { activityService } from "@/services";
import { apiRequest } from "@/services/api";
import { serviceConfig } from "@/services/config";
import type { Activity } from "@/types/domain";
import { ActivityList } from "./dashboards";
import { PageHeading } from "@/components/blocksubmit/shared";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ActivityPage() {
  const [items, setItems] = useState<Activity[]>([]);
  useEffect(() => {
    activityService.list().then(setItems);
  }, []);
  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="AUDIT TRAIL"
        title="Activity"
        description="A chronological view of assignment, submission, and integrity events."
      />
      <div className="max-w-3xl">
        <ActivityList items={items} />
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "application">("profile");

  // Application health state
  const [healthStatus, setHealthStatus] = useState<"loading" | "online" | "offline">("loading");
  const [healthService, setHealthService] = useState<string>("");
  const [healthError, setHealthError] = useState<string>("");

  function checkHealth() {
    setHealthStatus("loading");
    setHealthError("");
    apiRequest<{ status: string; service: string }>("/health")
      .then((data) => {
        if (data && data.status === "ok") {
          setHealthStatus("online");
          setHealthService(data.service || "blocksubmit-backend");
        } else {
          setHealthStatus("offline");
          setHealthError("Unexpected health response");
        }
      })
      .catch((err) => {
        setHealthStatus("offline");
        setHealthError(err instanceof Error ? err.message : "Connection failed");
      });
  }

  useEffect(() => {
    if (activeTab === "application") {
      checkHealth();
    }
  }, [activeTab]);

  if (!user) return null;

  function handleSignout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="ACCOUNT CONTROL"
        title="Settings"
        description="Manage your profile and application preferences."
      />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          <SettingNav
            icon={UserRound}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
          <SettingNav
            icon={KeyRound}
            label="Security"
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          />
          <SettingNav
            icon={MonitorCog}
            label="Application"
            active={activeTab === "application"}
            onClick={() => setActiveTab("application")}
          />
        </nav>

        {activeTab === "profile" && (
          <section className="panel max-w-2xl rounded-lg p-6">
            <div className="flex items-center gap-3 border-b pb-5">
              <span className="grid size-11 place-items-center rounded-md bg-primary/10 font-bold text-primary">
                {user.initials}
              </span>
              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">University Directory Identity</p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input className="mt-2" value={user.name} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input className="mt-2" value={user.email} readOnly />
              </div>
              <div>
                <Label>Department</Label>
                <Input className="mt-2" value={user.department} readOnly />
              </div>
              <div>
                <Label>Role</Label>
                <Input className="mt-2 capitalize" value={user.role} readOnly />
              </div>
            </div>
            <div className="mt-6 rounded-md border bg-accent/40 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Directory Synchronization</p>
              <p className="mt-1">
                Profile identity is synchronized directly from your institutional directory. Updates
                to name, institutional email, or academic department must be requested through your
                university registrar or administrator.
              </p>
            </div>
            <Button className="mt-6" disabled>
              Managed by university directory
            </Button>
          </section>
        )}

        {activeTab === "security" && (
          <section className="panel max-w-2xl rounded-lg p-6">
            <div className="flex items-center gap-3 border-b pb-5">
              <span className="grid size-11 place-items-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </span>
              <div>
                <h2 className="font-semibold">Security & Session</h2>
                <p className="text-sm text-muted-foreground">Account access and credentials</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 rounded-md border p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">AUTHENTICATED ROLE</p>
                  <p className="mt-1 font-semibold capitalize text-foreground">{user.role}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">SESSION TOKEN</p>
                  <p className="mt-1 font-mono text-xs text-primary">Active Bearer JWT</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">SESSION SCOPE</p>
                  <p className="mt-1 text-xs text-foreground">Single-origin browser storage</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">IDENTITY AUTHORITY</p>
                  <p className="mt-1 text-xs text-foreground">BlockSubmit Academic Integrity</p>
                </div>
              </div>

              <div className="rounded-md border bg-accent/40 p-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Credential Security Policy</p>
                <p className="mt-1">
                  Password management is governed by university identity policy. In-app password
                  modifications are restricted to protect academic integrity records and maintain an
                  immutable audit trail.
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold">Active Session Actions</p>
                <p className="text-xs text-muted-foreground">
                  Sign out of this workstation to terminate your session token.
                </p>
                <Button variant="destructive" className="mt-3 gap-2" onClick={handleSignout}>
                  <LogOut className="size-4" />
                  Sign out of current session
                </Button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "application" && (
          <section className="panel max-w-2xl rounded-lg p-6">
            <div className="flex items-center justify-between border-b pb-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-md bg-primary/10 text-primary">
                  <Server className="size-6" />
                </span>
                <div>
                  <h2 className="font-semibold">System Diagnostics</h2>
                  <p className="text-sm text-muted-foreground">Backend connectivity & network configuration</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={checkHealth}
                disabled={healthStatus === "loading"}
              >
                <RefreshCw
                  className={`size-3.5 ${healthStatus === "loading" ? "animate-spin" : ""}`}
                />
                Check status
              </Button>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">BACKEND API CONNECTIVITY</span>
                  {healthStatus === "loading" ? (
                    <span className="text-xs text-muted-foreground">Checking…</span>
                  ) : healthStatus === "online" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                      <CheckCircle2 className="size-3.5" />
                      Online ({healthService})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                      <AlertCircle className="size-3.5" />
                      Offline
                    </span>
                  )}
                </div>
                {healthError && <p className="mt-2 text-xs text-destructive">{healthError}</p>}
              </div>

              <div className="grid gap-4 rounded-md border p-4 text-xs sm:grid-cols-2">
                <div>
                  <p className="font-bold text-muted-foreground">API ENDPOINT</p>
                  <p className="mt-1 font-mono text-primary">{serviceConfig.apiUrl}</p>
                </div>
                <div>
                  <p className="font-bold text-muted-foreground">API CLIENT MODE</p>
                  <p className="mt-1 text-foreground">
                    {serviceConfig.useMock ? "Mock Repository" : "Live Backend API"}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-muted-foreground">BLOCKCHAIN RPC</p>
                  <p className="mt-1 font-mono text-primary">http://127.0.0.1:8545</p>
                </div>
                <div>
                  <p className="font-bold text-muted-foreground">BLOCKCHAIN NETWORK</p>
                  <p className="mt-1 text-foreground">Hardhat Local (Chain ID: 31337)</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-bold text-muted-foreground">INTEGRITY SMART CONTRACT</p>
                  <p className="mt-1 font-mono text-primary">0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SettingNav({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "flex w-full items-center gap-3 rounded-md bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary"
          : "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      }
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
