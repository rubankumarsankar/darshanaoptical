"use client";

import { useEffect, useState } from "react";

export default function ApiDocsPage() {
  const [activeViewer, setActiveViewer] = useState<"swagger" | "scalar">("swagger");

  // Load Swagger UI
  useEffect(() => {
    if (activeViewer !== "swagger") return;

    let link = document.getElementById("swagger-ui-css") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "swagger-ui-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css";
      document.head.appendChild(link);
    }

    let script = document.getElementById("swagger-ui-bundle") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "swagger-ui-bundle";
      script.src = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js";
      script.async = true;
      script.onload = () => {
        initSwagger();
      };
      document.body.appendChild(script);
    } else {
      initSwagger();
    }

    function initSwagger() {
      if ((window as any).SwaggerUIBundle) {
        (window as any).SwaggerUIBundle({
          url: "/openapi.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
            (window as any).SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: "StandaloneLayout",
          docExpansion: "list",
          defaultModelsExpandDepth: 2,
        });
      }
    }
  }, [activeViewer]);

  // Load Scalar
  useEffect(() => {
    if (activeViewer !== "scalar") return;

    let script = document.getElementById("scalar-script") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "scalar-script";
      script.src = "https://cdn.jsdelivr.net/npm/@scalar/api-reference";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [activeViewer]);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* Top Floating Switcher Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-neutral-200 bg-neutral-900 px-4 py-2.5 text-white">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            ← Back to Darshana Optical
          </a>
          <span className="text-neutral-600">|</span>
          <span className="text-xs font-bold text-white">
            Official API Documentation (OpenAPI 3.1)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewer("swagger")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              activeViewer === "swagger"
                ? "bg-[#62a03f] text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Swagger UI
          </button>
          <button
            onClick={() => setActiveViewer("scalar")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              activeViewer === "scalar"
                ? "bg-purple-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Scalar Docs
          </button>
          <a
            href="/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
          >
            openapi.json ↗
          </a>
        </div>
      </div>

      {/* Main Original Package View */}
      {activeViewer === "swagger" && (
        <div className="w-full bg-[#fafafa] min-h-screen">
          <div id="swagger-ui" />
        </div>
      )}

      {activeViewer === "scalar" && (
        <div className="w-full min-h-screen">
          {/* @ts-ignore */}
          <scalar-api-reference
            data-url="/openapi.json"
            data-proxy-url=""
            data-theme="purple"
            data-layout="modern"
            data-show-sidebar="true"
          />
        </div>
      )}
    </div>
  );
}
