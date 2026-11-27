import Image from "next/image";
import Link from "next/link";
import s from "./site.module.css";
import BookButton from "./BookButton";
import { NAV_LINKS } from "./data";

interface SiteHeaderProps {
  /** href of the current section, e.g. "/frames". Omit on the home page. */
  active?: string;
}

/** Transparent header that sits inside each page's dark hero. */
export default function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className={s.header}>
      <Link href="/" className={s.brand} aria-label="Darshana Optical, home">
        <Image src="/logo-white.png" alt="" width={600} height={377} priority sizes="61px" style={{ height: 38, width: "auto" }} />
        <span className={s.brandName}>Darshana Optical</span>
      </Link>
      <nav aria-label="Main" className={s.nav}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} aria-current={link.href === active ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
      </nav>
      <BookButton className={`${s.pill} ${s.pillOrange} ${s.btn} ${s.headerCta}`}>Book eye test</BookButton>
    </header>
  );
}
