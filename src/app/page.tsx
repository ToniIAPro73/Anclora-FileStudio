"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { SourceSelector, type AnalysisResult, type UniversalAnalysisResult } from "@/components/converter/source-selector";
import { InputAnalysisCard } from "@/components/converter/input-analysis-card";
import { CompatibilityPanel } from "@/components/converter/compatibility-panel";
import { JobProgressCard } from "@/components/converter/job-progress-card";
import { ArtifactResultCard } from "@/components/converter/artifact-result-card";
import { JobHistory } from "@/components/history/job-history";
import { ToolStatusPanel } from "@/components/diagnostics/tool-status-panel";
import type { CapabilityInfo } from "@/lib/domain/unified-analysis";
import { Layers, History, Stethoscope, CheckCircle2, ArrowRight } from "lucide-react";
import { t } from "@/i18n";

type Tab = "convert" | "history" | "diagnostics";

// Step-by-step flow states
type FlowStep = "source" | "analysis" | "format" | "confirm" | "progress" | "result";

interface JobStatusData {
  jobId: string;
  status: string;
  stage: string;
  progress: number;
  error?: string;
  outputFormat?: string;
  file?: {
    name: string;
    mimeType: string;
    sizeBytes: number;
    quality: string;
    format: string;
  };
  downloadAvailable?: boolean;
}

interface CapabilitiesData {
  capabilities: CapabilityInfo[];
  recommended: CapabilityInfo | null;
  inputFormat: string;
  inputCategory: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("convert");

  // Flow step
  const [flowStep, setFlowStep] = useState<FlowStep>("source");

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Capabilities state
  const [capabilities, setCapabilities] = useState<CapabilitiesData | null>(null);
  const [selectedCap, setSelectedCap] = useState<CapabilityInfo | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  // Job state
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusData | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Load capabilities when analysis is complete
  useEffect(() => {
    if (!analysisResult) return;
    const loadCaps = async () => {
      try {
        let body: Record<string, unknown>;
        if (analysisResult.kind === "universal-file") {
          body = { universalDescriptor: (analysisResult as UniversalAnalysisResult).universalDescriptor };
        } else {
          body = { descriptor: analysisResult.descriptor };
        }

        const res = await fetch("/api/capabilities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        const capData = data as CapabilitiesData;
        setCapabilities(capData);

        // Auto-select recommended capability
        const rec = capData.recommended;
        if (rec && rec.state === "available") {
          setSelectedCap(rec);
        } else {
          const firstAvailable = capData.capabilities.find((c) => c.state === "available");
          if (firstAvailable) {
            setSelectedCap(firstAvailable);
          }
        }

        // Move to analysis step, then format after caps loaded
        setFlowStep("analysis");
      } catch {
        // ignore — capabilities optional
      }
    };
    void loadCaps();
  }, [analysisResult]);

  // Advance to format step when capabilities are loaded
  useEffect(() => {
    if (flowStep === "analysis" && capabilities) {
      // Small delay so user sees the analysis card
      const timer = setTimeout(() => setFlowStep("format"), 400);
      return () => clearTimeout(timer);
    }
  }, [flowStep, capabilities]);

  // Poll job status
  useEffect(() => {
    if (!jobId || !isConverting) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json() as JobStatusData;
        setJobStatus(data);
        if (["completed", "failed", "cancelled"].includes(data.status)) {
          setIsConverting(false);
          if (data.status === "failed") toast.error(data.error ?? "La conversión ha fallado");
          if (data.status === "completed") setFlowStep("result");
        }
      } catch {
        // ignore polling error
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [jobId, isConverting]);

  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setCapabilities(null);
    setSelectedCap(null);
    setRightsConfirmed(false);
    setJobId(null);
    setJobStatus(null);
    setIsConverting(false);
    setFlowStep("source");
  }, []);

  const handleCapSelect = (cap: CapabilityInfo) => {
    setSelectedCap(cap);
  };

  const handleStartConversion = async () => {
    if (!analysisResult || !selectedCap) return;

    setIsConverting(true);
    setFlowStep("progress");
    setJobStatus({ jobId: "pending", status: "queued", stage: t("progress.queued"), progress: 0 });

    try {
      const body: Record<string, unknown> = {
        rightsConfirmed: true,
      };

      if (analysisResult.kind === "universal-file") {
        body.capabilityId = selectedCap.id;
        body.inputId = (analysisResult as UniversalAnalysisResult).inputId;
        body.format = selectedCap.outputFormat;
      } else if (analysisResult.kind === "remote-url") {
        body.url = analysisResult.normalizedUrl;
        body.format = selectedCap.outputFormat;
        body.quality = "5";
      } else {
        body.localFilePath = analysisResult.storedRelativePath;
        body.format = selectedCap.outputFormat;
        body.quality = "5";
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar");
      setJobId(data.jobId as string);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar la conversión");
      setIsConverting(false);
      setJobStatus(null);
      setFlowStep("format");
    }
  };

  const handleCancel = async () => {
    if (!jobId) return;
    try {
      await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      toast.info("Cancelando...");
    } catch {
      // ignore
    }
  };

  const selectedKey = selectedCap ? selectedCap.id : null;

  // Step indicator for the conversion flow
  const steps: { key: FlowStep; label: string; num: number }[] = [
    { key: "source", label: "Fuente", num: 1 },
    { key: "analysis", label: "Análisis", num: 2 },
    { key: "format", label: "Formato", num: 3 },
    { key: "confirm", label: "Confirmar", num: 4 },
    { key: "progress", label: "Progreso", num: 5 },
    { key: "result", label: "Resultado", num: 6 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === flowStep);
  const needsRights = analysisResult?.kind === "remote-url";

  return (
    <div lang="es" className="min-h-screen bg-[#0a0a0c] text-white">
      <Toaster position="top-center" richColors />

      {/* Radial gradient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(20,40,60,0.35) 0%, transparent 55%)",
        }}
        aria-hidden="true"
      />

      {/* App shell */}
      <div className="relative max-w-2xl mx-auto px-4 pb-24">
        {/* Header */}
        <header className="text-center pt-12 pb-8">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
                <path d="M10 15.5v-7l6 3.5-6 3.5z" />
                <path fillRule="evenodd" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM5 12a7 7 0 1014 0 7 7 0 00-14 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Link2Media</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Conversor <span className="text-cyan-400">universal local</span>
          </h1>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            Pega un enlace o sube cualquier archivo. El sistema detecta lo que se puede hacer con él.
          </p>
        </header>

        {/* Navigation tabs */}
        <nav
          aria-label="Secciones de la aplicación"
          className="flex rounded-2xl overflow-hidden border border-white/10 bg-white/4 mb-6"
        >
          {(
            [
              { id: "convert" as Tab, icon: <Layers className="h-4 w-4" />, label: t("nav.convert") },
              { id: "history" as Tab, icon: <History className="h-4 w-4" />, label: t("nav.history") },
              { id: "diagnostics" as Tab, icon: <Stethoscope className="h-4 w-4" />, label: t("nav.diagnostics") },
            ] as const
          ).map(({ id, icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`panel-${id}`}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 min-h-[44px] text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                activeTab === id
                  ? "bg-white/10 text-white"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        {/* Convertir panel */}
        <main id="panel-convert" role="tabpanel" aria-label="Panel de conversión" className={activeTab !== "convert" ? "hidden" : ""}>
          <div className="space-y-5">
            {/* Step indicator — only show after source step */}
            {flowStep !== "source" && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 motion-reduce:transition-none" aria-label="Pasos de conversión">
                {steps.map((step, i) => {
                  const isCompleted = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  // Skip confirm step if no rights needed
                  if (step.key === "confirm" && !needsRights) return null;

                  return (
                    <div key={step.key} className="flex items-center gap-1 flex-shrink-0">
                      {i > 0 && (step.key !== "confirm" || needsRights) && (
                        <ArrowRight className="h-3 w-3 text-white/15 flex-shrink-0" aria-hidden="true" />
                      )}
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors motion-reduce:transition-none ${
                          isCurrent
                            ? "bg-cyan-500/15 text-cyan-400"
                            : isCompleted
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "text-white/20"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <span className="h-3 w-3 flex items-center justify-center text-[9px]">{step.num}</span>
                        )}
                        <span className="hidden sm:inline">{step.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 1: Source selector */}
            {flowStep === "source" && (
              <section aria-labelledby="source-heading" className="animate-in fade-in slide-in-from-bottom-3 duration-400 motion-reduce:animate-none">
                <h2 id="source-heading" className="sr-only">Selecciona la fuente</h2>
                <SourceSelector
                  onUrlAnalyzed={(r) => setAnalysisResult(r)}
                  onFileAnalyzed={(r) => setAnalysisResult(r)}
                  isLoading={isLoading}
                  setLoading={setIsLoading}
                />
              </section>
            )}

            {/* Step 2: Analysis card */}
            {(flowStep === "analysis" || flowStep === "format" || flowStep === "confirm") && analysisResult && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400 motion-reduce:animate-none">
                <InputAnalysisCard result={analysisResult} onReset={handleReset} />

                {/* Step 3: Format selector / Compatibility panel */}
                {(flowStep === "format" || flowStep === "confirm") && capabilities && capabilities.capabilities.length > 0 && (
                  <section aria-labelledby="compat-heading" className="animate-in fade-in duration-300 motion-reduce:animate-none">
                    <h2 id="compat-heading" className="sr-only">Opciones de conversión</h2>
                    <CompatibilityPanel
                      capabilities={capabilities.capabilities}
                      recommended={capabilities.recommended}
                      onSelect={handleCapSelect}
                      selectedKey={selectedKey}
                    />
                  </section>
                )}

                {/* Step 4: Confirm & start */}
                {(flowStep === "format" || flowStep === "confirm") && selectedCap && (
                  <div className="pt-2 space-y-3 border-t border-white/5 animate-in fade-in duration-300 motion-reduce:animate-none">
                    {/* Rights confirmation — only for remote URL */}
                    {needsRights && (
                      <div className="flex items-start gap-3">
                        <input
                          id="rights-check"
                          type="checkbox"
                          checked={rightsConfirmed}
                          onChange={(e) => {
                            setRightsConfirmed(e.target.checked);
                            if (e.target.checked) setFlowStep("confirm");
                          }}
                          className="mt-1 accent-cyan-500 h-5 w-5 min-w-[20px] min-h-[20px]"
                        />
                        <label htmlFor="rights-check" className="text-xs text-white/50 cursor-pointer leading-relaxed">
                          {t("convert.rights")}. Soy responsable de respetar los derechos de autor.
                        </label>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleStartConversion()}
                      disabled={
                        isConverting ||
                        (needsRights && !rightsConfirmed)
                      }
                      className="w-full h-13 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] motion-reduce:transition-none"
                    >
                      {isConverting
                        ? "Procesando..."
                        : `${t("convert.start")} → ${selectedCap.outputFormat.toUpperCase()} — ${selectedCap.outputLabel}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Progress */}
            {flowStep === "progress" && jobStatus && (
              <section
                aria-live="polite"
                aria-labelledby="progress-heading"
                className="animate-in fade-in duration-300 motion-reduce:animate-none"
              >
                <h2 id="progress-heading" className="sr-only">Progreso de conversión</h2>
                <JobProgressCard
                  jobId={jobStatus.jobId}
                  status={jobStatus.status}
                  stage={jobStatus.stage}
                  progress={jobStatus.progress}
                  error={jobStatus.error}
                  onCancel={handleCancel}
                />
              </section>
            )}

            {/* Step 6: Result */}
            {flowStep === "result" && jobStatus?.file && (
              <section aria-labelledby="result-heading" className="animate-in fade-in duration-300 motion-reduce:animate-none">
                <h2 id="result-heading" className="sr-only">Resultado</h2>
                <ArtifactResultCard
                  jobId={jobStatus.jobId}
                  fileName={jobStatus.file.name ?? "download"}
                  format={jobStatus.file.format ?? jobStatus.outputFormat ?? ""}
                  mimeType={jobStatus.file.mimeType}
                  sizeBytes={jobStatus.file.sizeBytes}
                  downloadTokenHash={!!jobStatus.downloadAvailable}
                  onReset={handleReset}
                  onViewHistory={() => setActiveTab("history")}
                />
              </section>
            )}
          </div>
        </main>

        {/* History panel */}
        <div id="panel-history" role="tabpanel" aria-label="Panel de historial" className={activeTab !== "history" ? "hidden" : ""}>
          <JobHistory />
        </div>

        {/* Diagnostics panel */}
        <div id="panel-diagnostics" role="tabpanel" aria-label="Panel de diagnóstico" className={activeTab !== "diagnostics" ? "hidden" : ""}>
          <ToolStatusPanel />
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-widest">
            Link2Media · Procesamiento 100% local · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
