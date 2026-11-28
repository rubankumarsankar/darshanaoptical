"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import s from "../site/site.module.css";

const STEP_MS = 70;
const MAX_STAGGER_MS = 420;

/**
 * Plays the site's `reveal` fade-up once, as each element scrolls into view.
 * Elements that share a parent (cards in a grid) follow one another with a
 * short stagger. Works in every browser; content is never hidden without JS,
 * because the hiding CSS only applies once <html> carries data-reveal.
 */
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      delete root.dataset.reveal;
      return;
    }
    root.dataset.reveal = "on";
    const selector = `.${s.reveal}`;

    const io = new IntersectionObserver(
      (entries) => {
        // Stagger only the ones arriving together in the same parent.
        const groups = new Map<Element | null, HTMLElement[]>();
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          const list = groups.get(el.parentElement) ?? [];
          list.push(el);
          groups.set(el.parentElement, list);
        }
        for (const list of groups.values()) {
          list.forEach((el, i) => {
            el.style.setProperty("--reveal-delay", `${Math.min(i * STEP_MS, MAX_STAGGER_MS)}ms`);
            el.dataset.shown = "";
            // Once it has landed, hover effects go back to their normal speed.
            window.setTimeout(() => (el.dataset.done = ""), Math.min(i * STEP_MS, MAX_STAGGER_MS) + 950);
          });
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const watch = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (!("shown" in el.dataset)) io.observe(el);
      });
    };
    watch(document);

    // Cards added later (filters, tabs) reveal too.
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof HTMLElement && (n.matches(selector) ? io.observe(n) : watch(n)));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
