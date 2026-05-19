import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl, getApiBaseUrlDebug, PRODUCTION_API } from "@/config/env";

type CheckResult = {
  url: string;
  status: number | null;
  ok: boolean;
  detail: string;
};

const showByDefault =
  import.meta.env.DEV ||
  new URLSearchParams(window.location.search).has("debug");

async function probe(url: string, init?: RequestInit): Promise<CheckResult> {
  try {
    const res = await fetch(url, { ...init, credentials: "include" });
    const cors = res.headers.get("access-control-allow-origin");
    const text = await res.text();
    return {
      url,
      status: res.status,
      ok: res.ok,
      detail: `HTTP ${res.status}${cors ? ` · ACAO: ${cors}` : " · no Access-Control-Allow-Origin"} · ${text.slice(0, 100)}`,
    };
  } catch (e) {
    return {
      url,
      status: null,
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

export default function ConnectionDebug() {
  const [open, setOpen] = useState(showByDefault);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);

  const runChecks = useCallback(async () => {
    setRunning(true);
    const origin = window.location.origin;
    const base = getApiBaseUrl();
    const paths = ["/api/health", "/api/auth/ok", "/api/auth/get-session"];

    const results: CheckResult[] = [];
    for (const path of paths) {
      results.push(await probe(`${origin}${path}`));
    }

    if (base || new URLSearchParams(window.location.search).has("debug")) {
      for (const path of paths) {
        results.push(
          await probe(`${base || PRODUCTION_API}${path}`, { mode: "cors" })
        );
      }
    }

    setChecks(results);
    setRunning(false);
  }, []);

  useEffect(() => {
    if (open) void runChecks();
  }, [open, runChecks]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] rounded-full bg-amber-600/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
      >
        API debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[min(440px,95vw)] rounded-xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur">
      <div className="max-h-[70vh] overflow-auto p-4 text-xs font-mono text-zinc-200">
        <div className="mb-3 flex items-center justify-between gap-2">
          <strong className="text-sm text-amber-400">API connection debug</strong>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void runChecks()}
              disabled={running}
              className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50"
            >
              {running ? "Running…" : "Re-run"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded bg-white/10 px-2 py-1 hover:bg-white/20"
            >
              Hide
            </button>
          </div>
        </div>
        <dl className="mb-3 space-y-1 text-zinc-400">
          <div>
            <dt className="inline text-zinc-500">Origin: </dt>
            <dd className="inline break-all">{window.location.origin}</dd>
          </div>
          <div>
            <dt className="inline text-zinc-500">API base: </dt>
            <dd className="inline break-all">{getApiBaseUrlDebug()}</dd>
          </div>
        </dl>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li
              key={c.url}
              className={`rounded border p-2 ${c.ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-red-500/40 bg-red-500/10"}`}
            >
              <p className={c.ok ? "text-emerald-400" : "text-red-400"}>
                {c.ok ? "OK" : "FAIL"} {c.status ?? "—"}
              </p>
              <p className="mt-1 break-all text-zinc-400">{c.url}</p>
              <p className="mt-1 text-zinc-300">{c.detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 leading-relaxed text-zinc-500">
          CORS blocked? Redeploy API with TRUSTED_ORIGINS including this origin. Production
          should use same-origin <code className="text-amber-300">/api</code> (vercel.json rewrite).
          Open with <code className="text-amber-300">?debug</code>.
        </p>
      </div>
    </div>
  );
}
