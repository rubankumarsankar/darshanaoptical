"use client";

import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import { DEFAULT_CONTACT, whatsappWith, type ShopContact } from "@/app/lib/shop-contact";

const Ctx = createContext<ShopContact>(DEFAULT_CONTACT);

/**
 * Gives every page the shop's contact details from Admin › Settings.
 * Starts with the details the page was built with (no flash, works without JS),
 * then refreshes them once from /api/shop-contact so Settings changes show up.
 */
export function ShopContactProvider({ initial, children }: { initial: ShopContact; children: ReactNode }) {
  const [contact, setContact] = useState(initial);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/shop-contact", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((c: ShopContact | null) => c?.phone && setContact(c))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return <Ctx.Provider value={contact}>{children}</Ctx.Provider>;
}

export const useShopContact = () => useContext(Ctx);

type Kind = "tel" | "whatsapp" | "email" | "maps";
type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
  kind: Kind;
  /** WhatsApp only: a ready-typed message. */
  message?: string;
  /** Defaults to the phone, email or address itself. */
  children?: ReactNode | ((c: ShopContact) => ReactNode);
};

/** A link to call, WhatsApp, email or find the shop, always using the current Settings. */
export function ShopLink({ kind, message, children, ...rest }: LinkProps) {
  const c = useShopContact();
  const href =
    kind === "tel" ? c.tel : kind === "email" ? `mailto:${c.email}` : kind === "maps" ? c.mapsUrl : message ? whatsappWith(c, message) : c.whatsappUrl;
  const external = kind === "whatsapp" || kind === "maps";
  const fallback = kind === "tel" ? c.phone : kind === "email" ? c.email : kind === "maps" ? c.address : "WhatsApp";
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} {...rest}>
      {typeof children === "function" ? children(c) : (children ?? fallback)}
    </a>
  );
}

/** Plain text of one contact field, e.g. <ShopText field="phone" />. */
export function ShopText({ field }: { field: "phone" | "email" | "address" | "hours" | "street" | "city" | "pincode" }) {
  return <>{useShopContact()[field]}</>;
}
