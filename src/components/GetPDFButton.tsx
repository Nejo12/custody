"use client";

import { useState } from "react";
import PricingModal from "./PricingModal";

interface GetPDFButtonProps {
  documentType?: string;
  metadata?: Record<string, string>;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function GetPDFButton({
  documentType = "custody-document",
  metadata = {},
  variant = "primary",
  className = "",
}: GetPDFButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const baseClasses = "w-full rounded-lg text-sm transition-colors";
  const variantClasses =
    variant === "primary"
      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 p-3 hover:bg-black dark:hover:bg-white"
      : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-white border hover:bg-zinc-50 dark:hover:bg-zinc-700 p-3";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        Get Pro Document
      </button>

      <PricingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documentType={documentType}
        metadata={metadata}
      />
    </>
  );
}
