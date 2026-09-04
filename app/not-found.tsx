"use client";

import Link from "next/link";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useBooking } from "./components/booking/BookingContext";
import {
  Home,
  CalendarCheck,
  Glasses,
  Eye,
  Layers,
  Tag,
  MapPin,
  Phone,
  ArrowLeft,
  Search,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function NotFound() {
  const { openBooking } = useBooking();

  const quickLinks = [
    {
      title: "Spectacle Frames",
      desc: "1,200+ lightweight frames for men, women & kids",
      href: "/frames",
      icon: Glasses,
      badge: "1200+ Styles",
    },
    {
      title: "Eyeglass Lenses",
      desc: "Blue-cut digital protection & anti-glare lenses",
      href: "/lenses",
      icon: Layers,
      badge: "Anti-Glare",
    },
    {
      title: "Progressive Lenses",
      desc: "Line-free seamless vision for distance and reading",
      href: "/progressive",
      icon: Eye,
      badge: "No-Line",
    },
    {
      title: "Computerized Eye Test",
      desc: "Expert optometrist checkup with precision testing",
      href: "/eye-testing",
      icon: Eye,
      badge: "Harur",
    },
    {
      title: "Special Offers",
      desc: "Affordable combo packages & frame discounts",
      href: "/offers",
      icon: Tag,
      badge: "Save More",
    },
    {
      title: "Store Location & Contact",
      desc: "Opposite Vasanth & Co, Salem Bypass Road, Harur",
      href: "/contact",
      icon: MapPin,
      badge: "Open 7 Days",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 py-16 sm:py-24">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full mx-auto text-center">
          {/* Eyecare Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold tracking-wide uppercase mb-6 shadow-xs border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>404 Error &bull; Out of Focus</span>
          </div>

          {/* Graphical 404 with Glasses Centerpiece */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 my-2 select-none">
            <span className="text-7xl sm:text-9xl font-black tracking-tighter text-slate-900">
              4
            </span>
            <div className="relative flex items-center justify-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white shadow-xl shadow-slate-200 border border-slate-200/80 animate-pulse">
              <Glasses className="w-12 h-12 sm:w-20 sm:h-20 text-teal-600" strokeWidth={1.75} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-500 rounded-full ring-4 ring-white" />
            </div>
            <span className="text-7xl sm:text-9xl font-black tracking-tighter text-slate-900">
              4
            </span>
          </div>

          {/* Heading and Description */}
          <h1 className="mt-6 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Looking a Little Blurry?
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable. Let&apos;s get your vision back on track.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
            >
              <Home className="w-4 h-4" />
              <span>Back to Homepage</span>
            </Link>

            <button
              type="button"
              onClick={openBooking}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Eye Test</span>
            </button>

            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-all text-sm sm:text-base cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Quick Destination Grid */}
          <div className="mt-14 pt-10 border-t border-slate-200/80 text-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-600" />
                <span>Explore Popular Destinations</span>
              </h2>
              <span className="text-xs text-slate-400">Darshana Optical Harur</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex flex-col justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors text-sm">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Need help footer strip */}
          <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 border border-teal-100/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Need immediate assistance?</h4>
                <p className="text-xs text-slate-600">
                  Our opticians in Harur are ready to help you find the right frame or test.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="tel:+918870571536"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-800 font-semibold text-xs border border-slate-200 hover:border-teal-500 hover:text-teal-700 transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>+91 88705 71536</span>
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Visit Store</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
