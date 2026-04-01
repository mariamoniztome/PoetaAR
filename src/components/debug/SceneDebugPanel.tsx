import { useEffect, useMemo, useState } from 'react';

interface SceneDebugPanelProps {
  title: string;
  values: unknown;
  onReset: () => void;
  children: React.ReactNode;
}

export function SceneDebugPanel({ title, values, onReset, children }: SceneDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const serialized = useMemo(() => JSON.stringify(values, null, 2), [values]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(serialized);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Ignore clipboard failures silently (e.g. unsupported browser context)
      setCopied(false);
    }
  };

  return (
    <aside className="absolute top-3 right-3 z-40 w-[320px] max-w-[90vw] rounded-xl border border-white/30 bg-black/70 text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/20 px-3 py-2">
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded border border-white/30 px-2 py-0.5 text-xs hover:bg-white/10"
        >
          {isOpen ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {isOpen && (
        <div className="max-h-[70vh] overflow-y-auto px-3 py-3">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={copyToClipboard}
              className="rounded bg-white/15 px-2 py-1 text-xs font-medium hover:bg-white/25"
            >
              {copied ? 'Copiado' : 'Exportar JSON'}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded border border-white/30 px-2 py-1 text-xs font-medium hover:bg-white/10"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3">{children}</div>
        </div>
      )}
    </aside>
  );
}

interface DebugSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DebugSection({ title, children }: DebugSectionProps) {
  return (
    <section className="rounded-lg border border-white/20 bg-white/5 p-2">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/80">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

interface DebugNumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function DebugNumberInput({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
}: DebugNumberInputProps) {
  const [textValue, setTextValue] = useState(String(value));

  useEffect(() => {
    setTextValue(String(value));
  }, [value]);

  const commitValue = (raw: string) => {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    } else {
      setTextValue(String(value));
    }
  };

  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-white/80">{label}</span>
      <input
        type="number"
        className="w-24 rounded border border-white/20 bg-black/40 px-1.5 py-0.5 text-right text-xs"
        value={textValue}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const raw = e.target.value;
          setTextValue(raw);
          const parsed = Number(raw);
          if (Number.isFinite(parsed)) {
            onChange(parsed);
          }
        }}
        onBlur={(e) => commitValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitValue((e.target as HTMLInputElement).value);
          }
        }}
      />
    </label>
  );
}

interface DebugSliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export function DebugSliderInput({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: DebugSliderInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/80">{label}</span>
        <span className="tabular-nums text-white/80">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="w-full"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

interface DebugColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

interface DebugToggleInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function DebugColorInput({ label, value, onChange }: DebugColorInputProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-white/80">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="color"
          className="h-6 w-8 cursor-pointer rounded border border-white/30 bg-transparent p-0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className="w-20 rounded border border-white/20 bg-black/40 px-1.5 py-0.5 text-right text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

export function DebugToggleInput({ label, checked, onChange }: DebugToggleInputProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-white/80">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`rounded px-2 py-1 text-xs font-semibold ${checked ? 'bg-emerald-500/80 text-black' : 'bg-white/15 text-white'}`}
      >
        {checked ? 'ON' : 'OFF'}
      </button>
    </label>
  );
}
