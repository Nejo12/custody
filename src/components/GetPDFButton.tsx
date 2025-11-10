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

  const baseClasses =
    "px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg";
  const variantClasses =
    variant === "primary"
      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl"
      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-purple-600 hover:bg-purple-50 dark:hover:bg-gray-700";

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        📄 Get Professional PDF
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
