import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusPillProps {
  status: string;
}

export function StatusPill({ status }: StatusPillProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  
  switch (status.toLowerCase()) {
    case "active":
    case "paid":
    case "completed":
    case "published":
      variant = "default";
      break;
    case "renewal due":
    case "expired":
    case "cancelled":
    case "inactive":
    case "no response":
      variant = "destructive";
      break;
    case "pending":
    case "partial":
    case "scheduled":
      variant = "secondary";
      break;
    default:
      variant = "outline";
  }

  return <Badge variant={variant}>{status}</Badge>;
}
