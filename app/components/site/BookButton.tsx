"use client";

import type { CSSProperties, ReactNode } from "react";
import { useBooking } from "../booking/BookingContext";

interface BookButtonProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Opens the site-wide booking modal. The only client piece most sections need. */
export default function BookButton({ className, style, children }: BookButtonProps) {
  const { openBooking } = useBooking();
  return (
    <button type="button" onClick={openBooking} className={className} style={style}>
      {children}
    </button>
  );
}
