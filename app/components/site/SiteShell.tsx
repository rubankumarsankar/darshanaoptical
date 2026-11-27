import type { ReactNode } from "react";
import s from "./site.module.css";
import SiteFooter from "./SiteFooter";
import WhatsAppButton from "../motion/WhatsAppButton";
import { siteFontVars } from "./fonts";

interface SiteShellProps {
  children: ReactNode;
  /** Show the orange "Need an eye test?" band above the footer. */
  footerCta?: boolean;
}

/** Fonts, design tokens and footer shared by every public page. */
export default function SiteShell({ children, footerCta = true }: SiteShellProps) {
  return (
    <div className={`${siteFontVars} ${s.root}`}>
      {children}
      <SiteFooter cta={footerCta} />
      <WhatsAppButton />
    </div>
  );
}
