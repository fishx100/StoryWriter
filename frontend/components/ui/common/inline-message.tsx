"use client";

import React from "react";

export interface InlineMessageProps {
  message: string;
  type?: "info" | "warning" | "error";
}

export function InlineMessage({ message, type = "info" }: InlineMessageProps) {
  let className = "";
  if (type === "info") className = "sw-inline-message-info";
  if (type === "warning") className = "sw-inline-message-warning";
  if (type === "error") className = "sw-inline-message-error";

  return <div className={className}>{message}</div>;
}
