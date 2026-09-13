export interface ClassifyOptionsValue {
  topK: number;
  width: number;
  height: number;
}

export interface ClassifyOptionsProps {
  value: ClassifyOptionsValue;
  onChange: (value: ClassifyOptionsValue) => void;
  disabled?: boolean;
}

const fieldClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50";

/** Top-K / model width / model height — mirrors `#cls-topk` / `#cls-w` / `#cls-h`. */
export function ClassifyOptions({ value, onChange, disabled }: ClassifyOptionsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-1">
        <label htmlFor="cls-topk" className="text-xs text-muted-foreground">
          Top-K
        </label>
        <input
          id="cls-topk"
          type="number"
          min={1}
          max={1000}
          value={value.topK}
          disabled={disabled}
          className={fieldClass}
          onChange={(e) => onChange({ ...value, topK: parseInt(e.target.value, 10) || 5 })}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="cls-w" className="text-xs text-muted-foreground">
          Width
        </label>
        <input
          id="cls-w"
          type="number"
          min={1}
          max={4096}
          value={value.width}
          disabled={disabled}
          className={fieldClass}
          onChange={(e) => onChange({ ...value, width: parseInt(e.target.value, 10) || 224 })}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="cls-h" className="text-xs text-muted-foreground">
          Height
        </label>
        <input
          id="cls-h"
          type="number"
          min={1}
          max={4096}
          value={value.height}
          disabled={disabled}
          className={fieldClass}
          onChange={(e) => onChange({ ...value, height: parseInt(e.target.value, 10) || 224 })}
        />
      </div>
    </div>
  );
}
