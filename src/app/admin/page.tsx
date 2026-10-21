"use client";

import { FormEvent, useEffect, useState } from "react";

type StaffRole = "FIELD_WORKER" | "SUPERVISOR" | "ADMIN";

type Team = {
  id: string;
  name: string;
  department: { id: string; name: string };
};

type StaffMember = {
  id: string;
  clerkUserId: string;
  name: string | null;
  email: string | null;
  role: StaffRole;
  teamMemberships: { team: { id: string; name: string; department: { name: string } } }[];
};

type AuditEvent = {
  id: string;
  action: string;
  actorName: string;
  targetName: string | null;
  summary: string | null;
  createdAt: string;
};

type AdminData = {
  staff: StaffMember[];
  audit: AuditEvent[];
};

async function requestAdminData(): Promise<{ data: AdminData; teams: Team[] }> {
  const [staffResponse, teamResponse] = await Promise.all([
    fetch("/api/admin/staff", { cache: "no-store" }),
    fetch("/api/staff/teams", { cache: "no-store" }),
  ]);
  const staffPayload = (await staffResponse.json()) as AdminData & { error?: string };
  const teamPayload = (await teamResponse.json()) as { teams?: Team[]; error?: string };
  if (!staffResponse.ok) {
    throw new Error(staffPayload.error || "Unable to load staff administration.");
  }
  if (!teamResponse.ok) {
    throw new Error(teamPayload.error || "Unable to load teams.");
  }
  return { data: staffPayload, teams: teamPayload.teams ?? [] };
}

const roleLabels: Record<StaffRole, string> = {
  FIELD_WORKER: "Field worker",
  SUPERVISOR: "Supervisor",
  ADMIN: "Administrator",
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [staffRole, setStaffRole] = useState<StaffRole>("FIELD_WORKER");
  const [loading, setLoading] = useState(true);
  const [savingStaff, setSavingStaff] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    requestAdminData()
      .then(({ data: nextData, teams: nextTeams }) => {
        if (active) {
          setData(nextData);
          setTeams(nextTeams);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load administration data.");
          setData(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function loadData() {
    try {
      const nextData = await requestAdminData();
      setData(nextData.data);
      setTeams(nextData.teams);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load administration data.");
      setData(null);
    }
  }

  async function handleStaffSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingStaff(true);
    setError("");
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const teamIds = form.getAll("teamIds").filter((value): value is string => typeof value === "string");
    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId: form.get("clerkUserId"),
          name: form.get("name"),
          email: form.get("email"),
          role: form.get("role"),
          teamIds,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Unable to save staff account.");
      }
      formElement.reset();
      setStaffRole("FIELD_WORKER");
      setMessage("Staff account saved.");
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save staff account.");
    } finally {
      setSavingStaff(false);
    }
  }

  async function handleTeamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingTeam(true);
    setError("");
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      const response = await fetch("/api/staff/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentName: form.get("departmentName"),
          teamName: form.get("teamName"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Unable to create team.");
      }
      formElement.reset();
      setMessage("Team created.");
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to create team.");
    } finally {
      setSavingTeam(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f7f1] px-4 py-8 text-[#1c241c] md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477254]">WasteLoop CG</p>
          <h1 className="mt-1 text-3xl font-black text-[#143826]">Staff administration</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#556955]">
            Create departments and teams, then map existing Clerk accounts to staff roles. Only administrators
            can use these controls.
          </p>
        </header>

        {(error || message) && (
          <div
            role={error ? "alert" : "status"}
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={handleTeamSubmit} className="rounded-2xl border border-[#d8e3d2] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#143826]">Create department team</h2>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm font-semibold">
                Department
                <input
                  name="departmentName"
                  required
                  maxLength={120}
                  className="rounded-lg border border-[#cbd8c6] px-3 py-2 font-normal"
                  placeholder="Sanitation"
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Team
                <input
                  name="teamName"
                  required
                  maxLength={120}
                  className="rounded-lg border border-[#cbd8c6] px-3 py-2 font-normal"
                  placeholder="North Zone Field Team"
                />
              </label>
              <button
                type="submit"
                disabled={savingTeam}
                className="justify-self-start rounded-lg bg-[#204e37] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {savingTeam ? "Creating..." : "Create team"}
              </button>
            </div>
          </form>

          <form onSubmit={handleStaffSubmit} className="rounded-2xl border border-[#d8e3d2] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#143826]">Provision staff account</h2>
            <p className="mt-1 text-xs text-[#627462]">
              The person must already have an account in the configured Clerk instance.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
                Clerk user ID
                <input
                  name="clerkUserId"
                  required
                  maxLength={255}
                  pattern="user_[A-Za-z0-9_-]+"
                  className="rounded-lg border border-[#cbd8c6] px-3 py-2 font-normal"
                  placeholder="user_..."
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Display name
                <input
                  name="name"
                  required
                  maxLength={120}
                  className="rounded-lg border border-[#cbd8c6] px-3 py-2 font-normal"
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Email
                <input
                  name="email"
                  type="email"
                  maxLength={254}
                  className="rounded-lg border border-[#cbd8c6] px-3 py-2 font-normal"
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
                Role
                <select
                  name="role"
                  value={staffRole}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (value === "FIELD_WORKER" || value === "SUPERVISOR" || value === "ADMIN") {
                      setStaffRole(value);
                    }
                  }}
                  className="rounded-lg border border-[#cbd8c6] px-3 py-2 font-normal"
                >
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <option key={role} value={role}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {staffRole === "FIELD_WORKER" && (
                <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
                  Team membership
                  <select
                    name="teamIds"
                    multiple
                    size={Math.min(Math.max(teams.length, 2), 5)}
                    className="rounded-lg border border-[#cbd8c6] px-3 py-2 font-normal"
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.department.name} / {team.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="submit"
                disabled={savingStaff}
                className="justify-self-start rounded-lg bg-[#204e37] px-4 py-2 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2"
              >
                {savingStaff ? "Saving..." : "Save staff account"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-[#d8e3d2] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#143826]">Staff directory</h2>
          {loading ? (
            <p className="py-6 text-sm text-[#627462]">Loading staff...</p>
          ) : !data ? (
            <p className="py-6 text-sm text-[#627462]">Staff data is unavailable for this account.</p>
          ) : data.staff.length === 0 ? (
            <p className="py-6 text-sm text-[#627462]">No staff accounts have been provisioned.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[#e0e8dc] text-xs uppercase text-[#647764]">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Teams</th>
                    <th className="py-2">Clerk user ID</th>
                  </tr>
                </thead>
                <tbody>
                  {data.staff.map((member) => (
                    <tr key={member.id} className="border-b border-[#edf1ea] align-top">
                      <td className="py-3 pr-4">
                        <div className="font-semibold">{member.name || "Unnamed staff"}</div>
                        <div className="text-xs text-[#647764]">{member.email || "No email recorded"}</div>
                      </td>
                      <td className="py-3 pr-4">{roleLabels[member.role]}</td>
                      <td className="py-3 pr-4">
                        {member.teamMemberships.length
                          ? member.teamMemberships
                              .map(({ team }) => `${team.department.name} / ${team.name}`)
                              .join(", ")
                          : "—"}
                      </td>
                      <td className="py-3 font-mono text-xs">{member.clerkUserId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#d8e3d2] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#143826]">Recent administrative activity</h2>
          {!data ? (
            <p className="py-4 text-sm text-[#627462]">Audit history is unavailable.</p>
          ) : data.audit.length === 0 ? (
            <p className="py-4 text-sm text-[#627462]">No administrative changes recorded yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#edf1ea]">
              {data.audit.map((event) => (
                <li key={event.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <span>
                    <strong>{event.actorName}</strong> {event.action.toLowerCase().replaceAll("_", " ")}
                    {event.targetName ? `: ${event.targetName}` : ""}
                    {event.summary ? ` — ${event.summary}` : ""}
                  </span>
                  <time className="text-xs text-[#647764]" dateTime={event.createdAt}>
                    {new Date(event.createdAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
