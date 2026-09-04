"use client";

import { useState } from "react";

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<"swagger" | "scalar">("swagger");

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white text-neutral-900">
      {/* Top Navbar */}
      <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-neutral-800 bg-[#161922] px-4 text-white">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            ← Store Home
          </a>
          <span className="text-neutral-700">|</span>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-white tracking-tight">
              Darshana Optical API Documentation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("swagger")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "swagger"
                ? "bg-[#62a03f] text-white shadow-sm"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Swagger UI
          </button>
          <button
            onClick={() => setActiveTab("scalar")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "scalar"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Scalar Docs
          </button>
          <a
            href="/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            openapi.json ↗
          </a>
        </div>
      </header>

      {/* Main Full-Height Original Docs Frame */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#fafafa]">
        {activeTab === "swagger" && (
          <iframe
            src="/swagger.html"
            title="Swagger UI Documentation"
            className="h-full w-full border-0"
          />
        )}
        {activeTab === "scalar" && (
          <iframe
            src="/scalar.html"
            title="Scalar API Reference"
            className="h-full w-full border-0"
          />
        )}
      </div>
    </div>
  );
}
