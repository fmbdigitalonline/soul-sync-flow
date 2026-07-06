import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface LegacyRedirectProps {
  /** Where to send the user */
  to: string;
  /** Toast title shown once after redirect */
  title: string;
  /** Toast description shown once after redirect */
  description?: string;
}

/**
 * Redirects legacy routes (e.g. /dreams, /spiritual-growth) into the
 * companion conversation, showing a one-time toast so existing users
 * understand where the feature went. UI components and services for
 * these features remain intact — only the standalone routes are retired.
 */
const LegacyRedirect = ({ to, title, description }: LegacyRedirectProps) => {
  const { toast } = useToast();
  const hasToasted = useRef(false);

  useEffect(() => {
    if (!hasToasted.current) {
      hasToasted.current = true;
      toast({ title, description });
    }
  }, [toast, title, description]);

  return <Navigate to={to} replace />;
};

export default LegacyRedirect;
