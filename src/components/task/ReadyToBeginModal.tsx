
import React from "react";
import { Button } from "@/components/ui/button";

interface ReadyToBeginModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  estimatedDuration: string;
}

export const ReadyToBeginModal: React.FC<ReadyToBeginModalProps> = ({
  open,
  onConfirm,
  onCancel,
  estimatedDuration
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-xs w-full border border-slate-200">
        <div className="text-xl font-semibold mb-3 text-center">Ready to Begin?</div>
        <div className="text-gray-700 mb-4 text-center">
          This session will take about <strong>{estimatedDuration || "~30 mins"}</strong>.<br />
          Your Coach will guide you step by step.<br />
          Are you ready to focus?
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-soul-purple text-white" onClick={onConfirm}>Let's Go!</Button>
        </div>
      </div>
    </div>
  );
};
