"use client";
import { useState } from "react";
import Header from "./Header";
import HelpSheet from "./HelpSheet";

export default function HeaderWithHelp() {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <>
      <Header onOpenHelp={() => setHelpOpen(true)} />
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
