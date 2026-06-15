"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle } from "lucide-react";

interface HealthDependency {
  name: string;
  available: boolean;
  version: string | null;
  path: string | null;
  status: "ok" | "missing" | "error";
  recommendedAction: string | null;
}

interface HealthData {
  ok: boolean;
  app: string;
  status: string;
  dependencies: HealthDependency[];
  summary: {
    total: number;
    available: number;
    missing: number;
  };
}

function ToolRow({ dep }: { dep: HealthDependency }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0 gap-3">
      <div className="flex items-start gap-2.5 min-w-0">
        {dep.available ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <span className="text-sm text-white/80">{dep.name}</span>
          {!dep.available && dep.recommendedAction && (
            <p className="text-[10px] text-amber-400/80 mt-0.5 leading-tight">
              {dep.recommendedAction}
            </p>
          )}
        </div>
      </div>
      <span className={`text-xs font-mono shrink-0 ${dep.available ? "text-white/40" : "text-red-400"}`}>
        {dep.version ?? (dep.available ? "✓" : "✗")}
      </span>
    </div>
  );
}

interface PanelState {
  data: HealthData | null;
  loading: boolean;
}

export function ToolStatusPanel() {
  const [state, setState] = useState<PanelState>({ data: null, loading: true });

  const load = () => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((json) => setState({ data: json as HealthData, loading: false }))
      .catch(() => setState({ data: null, loading: false }));
  };

  const refresh = () => {
    setState((s) => ({ ...s, loading: true }));
    load();
  };

  useEffect(() => { load(); }, []);

  const { data, loading } = state;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Diagnóstico</h2>
        <button
          type="button"
          onClick={() => refresh()}
          disabled={loading}
          aria-label="Actualizar diagnóstico"
          className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 min-h-[44px] disabled:opacity-50 motion-reduce:transition-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 motion-reduce:animate-none ${loading ? "animate-spin" : ""}`} />
          Verificar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-white/30">
          <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" />
        </div>
      ) : !data ? (
        <div className="text-sm text-red-400 py-4 text-center">
          No se pudo conectar al servidor de diagnóstico.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-white/10 bg-white/3 p-4">
            {/* Overall status */}
            <div
              className={`rounded-lg px-3 py-2 mb-4 text-sm flex items-center gap-2 ${
                data.ok
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {data.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {data.ok
                ? "Sistema listo para convertir"
                : data.status === "degraded"
                  ? "Funcionalidad limitada — algunos motores no están disponibles"
                  : "Algunas dependencias no están disponibles"}
            </div>

            {/* Summary */}
            <div className="flex gap-4 mb-4 text-xs text-white/40">
              <span>{data.summary.available}/{data.summary.total} disponibles</span>
              {data.summary.missing > 0 && (
                <span className="text-amber-400">{data.summary.missing} no disponibles</span>
              )}
            </div>

            {/* Tool list */}
            <div>
              {data.dependencies.map((dep) => (
                <ToolRow key={dep.name} dep={dep} />
              ))}
            </div>
          </div>

          {/* Missing tools recommendations */}
          {data.summary.missing > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400 space-y-1.5">
              <p className="font-medium">¿Cómo solucionar esto?</p>
              <ul className="space-y-1 text-xs text-amber-400/80">
                {data.dependencies
                  .filter((d) => !d.available && d.recommendedAction)
                  .map((d) => (
                    <li key={d.name}>• <strong>{d.name}:</strong> {d.recommendedAction}</li>
                  ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
