import React, { useState } from "react";

/**
 * CardShell — enforces the Card Charter for every message part:
 * collapsed-by-default, bubble-native visual language, expand-in-place,
 * no navigation, no modals. Cards operate; the twin narrates.
 */
export const CardShell: React.FC<{
  summary: React.ReactNode;
  children?: React.ReactNode; // expanded content
  fossil?: boolean;           // older instance: quiet one-liner
  onPrimary?: () => void;     // deterministic rail: tapping the summary ACTS
                              // (e.g. OfferCard confirm) instead of expanding
}> = ({ summary, children, fossil, onPrimary }) => {
  const [open, setOpen] = useState(false);
  if (fossil) {
    return (
      <div className="mt-2 text-xs text-muted-foreground border border-muted rounded-xl px-3 py-1.5 opacity-70">
        {summary}
      </div>
    );
  }
  const handleClick = () => {
    if (onPrimary) { onPrimary(); return; }
    if (children) setOpen((v) => !v);
  };
  return (
    <div className="mt-2 rounded-2xl border border-soul-purple/25 bg-soul-purple/5 overflow-hidden">
      <button
        type="button"
        onClick={handleClick}
        className="w-full text-left px-4 py-3"
      >
        {summary}
      </button>
      {open && children && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
};
