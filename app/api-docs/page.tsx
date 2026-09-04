"use client";

import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Sparkles, Layers, BookOpen, ExternalLink, Code } from "lucide-react";

export default function ApiDocsPage() {
  const [activeViewer, setActiveViewer] = useState<"swagger" | "scalar">("swagger");

  // Load Swagger UI when activeViewer is swagger
  useEffect(() => {
    if (activeViewer !== "swagger") return;

    // Load Swagger CSS
    let link = document.getElementById("swagger-ui-css") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "swagger-ui-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css";
      document.head.appendChild(link);
    }

    // Load Swagger JS Bundle
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
          dom_id: "#swagger-ui-container",
          deepLinking: true,
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
            (window as any).SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: "BaseLayout",
          docExpansion: "list",
          defaultModelsExpandDepth: 2,
        });
      }
    }
  }, [activeViewer]);

  // Load Scalar when activeViewer is scalar
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
    <>
      <Header />
      <main className="min-h-screen bg-[#0f1117] text-white">
        {/* Top Control Bar */}
        <div className="border-b border-neutral-800 bg-[#161922] py-4">
          <div className="container-brand flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Darshana Optical API Reference
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
                  OpenAPI 3.1
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                TiDB Cloud MySQL Backend • Interactive Sandbox
              </p>
            </div>

            {/* UI Theme & Viewer Switcher */}
            <div className="flex items-center gap-2 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveViewer("swagger")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeViewer === "swagger"
                    ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Sparkles size={14} />
                <span>Swagger UI</span>
              </button>

              <button
                onClick={() => setActiveViewer("scalar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeViewer === "scalar"
                    ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Layers size={14} />
                <span>Modern Docs</span>
              </button>

              <a
                href="/openapi.json"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                title="View Raw OpenAPI Spec"
              >
                <Code size={13} />
                <span>JSON</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="w-full">
          {activeViewer === "swagger" && (
            <div className="p-4 sm:p-8 max-w-6xl mx-auto">
              <style jsx global>{`
                #swagger-ui-container .swagger-ui {
                  color: #e5e7eb;
                  font-family: inherit;
                }
                #swagger-ui-container .swagger-ui .info .title {
                  color: #ffffff;
                }
                #swagger-ui-container .swagger-ui .info p,
                #swagger-ui-container .swagger-ui .info li {
                  color: #9ca3af;
                }
                #swagger-ui-container .swagger-ui .scheme-container {
                  background: #161922;
                  box-shadow: none;
                  border: 1px solid #262935;
                  border-radius: 16px;
                  padding: 16px;
                  margin-bottom: 24px;
                }
                #swagger-ui-container .swagger-ui .opblock {
                  border-radius: 14px;
                  border: 1px solid #262935;
                  background: #161922;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
                  margin-bottom: 16px;
                }
                #swagger-ui-container .swagger-ui .opblock .opblock-summary {
                  padding: 12px 16px;
                }
                #swagger-ui-container .swagger-ui .opblock.opblock-post {
                  border-color: rgba(16, 185, 129, 0.3);
                  background: rgba(16, 185, 129, 0.05);
                }
                #swagger-ui-container .swagger-ui .opblock.opblock-get {
                  border-color: rgba(59, 130, 246, 0.3);
                  background: rgba(59, 130, 246, 0.05);
                }
                #swagger-ui-container .swagger-ui .opblock .opblock-summary-method {
                  border-radius: 8px;
                  font-weight: 800;
                  font-size: 11px;
                }
                #swagger-ui-container .swagger-ui .opblock .opblock-summary-path {
                  color: #f3f4f6;
                  font-weight: 600;
                }
                #swagger-ui-container .swagger-ui .opblock .opblock-summary-description {
                  color: #9ca3af;
                  font-size: 13px;
                }
                #swagger-ui-container .swagger-ui .opblock-body {
                  background: #11131a;
                  border-top: 1px solid #262935;
                }
                #swagger-ui-container .swagger-ui .opblock-section-header {
                  background: #161922;
                  color: #ffffff;
                }
                #swagger-ui-container .swagger-ui .tabli button {
                  color: #9ca3af;
                }
                #swagger-ui-container .swagger-ui .tabli.active button {
                  color: #fc5a06;
                  font-weight: 700;
                }
                #swagger-ui-container .swagger-ui .btn.execute {
                  background-color: #fc5a06;
                  border-color: #fc5a06;
                  color: #ffffff;
                  border-radius: 10px;
                  font-weight: 700;
                }
                #swagger-ui-container .swagger-ui .btn.execute:hover {
                  background-color: #e04e03;
                }
                #swagger-ui-container .swagger-ui .btn.try-out__btn {
                  border-radius: 8px;
                  color: #f3f4f6;
                  border-color: #374151;
                }
                #swagger-ui-container .swagger-ui select,
                #swagger-ui-container .swagger-ui input[type="text"],
                #swagger-ui-container .swagger-ui textarea {
                  background: #0b0c10;
                  color: #f3f4f6;
                  border: 1px solid #374151;
                  border-radius: 8px;
                }
                #swagger-ui-container .swagger-ui .highlight-code {
                  background: #0b0c10;
                }
                #swagger-ui-container .swagger-ui table.model {
                  color: #e5e7eb;
                }
                #swagger-ui-container .swagger-ui section.models {
                  border: 1px solid #262935;
                  border-radius: 16px;
                  background: #161922;
                }
                #swagger-ui-container .swagger-ui section.models h4 {
                  color: #ffffff;
                }
              `}</style>
              <div id="swagger-ui-container" />
            </div>
          )}

          {activeViewer === "scalar" && (
            <div className="w-full">
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
      </main>
      <Footer />
    </>
  );
}
