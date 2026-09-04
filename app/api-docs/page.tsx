"use client";

import { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Database, Send, CheckCircle2, Code2, Copy, Check, Terminal, ExternalLink } from "lucide-react";

const ENDPOINTS = [
  {
    id: "appointments-post",
    method: "POST",
    path: "/api/appointments",
    title: "Create Eye Test Appointment",
    description: "Saves a new customer appointment booking into the TiDB MySQL database.",
    requestBody: {
      name: "Ramesh Kumar (Required)",
      phone: "+91 88705 71536 (Required)",
      email: "ramesh@example.com (Optional)",
      preferred_date: "2026-09-10 (Optional)",
      preferred_time: "10:30 AM (Optional)",
      test_type: "Comprehensive Eye Test",
      wears_glasses: "Yes",
      notes: "Looking for progressive lenses",
    },
    samplePayload: {
      name: "Ramesh Kumar",
      phone: "+918870571536",
      email: "ramesh@example.com",
      preferred_date: "2026-09-10",
      preferred_time: "10:30 AM",
      test_type: "Comprehensive Eye Test",
      wears_glasses: "Yes",
      notes: "Looking for progressive lenses",
    },
    sampleResponse: {
      success: true,
      message: "Appointment request saved successfully.",
      id: 1,
    },
  },
  {
    id: "appointments-get",
    method: "GET",
    path: "/api/appointments",
    title: "Get Total Appointments Count",
    description: "Fetches aggregate appointment metrics and database health.",
    requestBody: null,
    samplePayload: null,
    sampleResponse: {
      success: true,
      count: [{ total: 12 }],
    },
  },
  {
    id: "inquiries-post",
    method: "POST",
    path: "/api/inquiries",
    title: "Submit Contact / Product Inquiry",
    description: "Saves a customer inquiry message into the TiDB MySQL database.",
    requestBody: {
      name: "Priya Sundaram (Required)",
      phone: "+91 88705 71536 (Required)",
      email: "priya@example.com (Optional)",
      interest: "Progressive Lenses",
      message: "Need price details on blue cut progressive glasses.",
    },
    samplePayload: {
      name: "Priya Sundaram",
      phone: "+918870571536",
      email: "priya@example.com",
      interest: "Progressive Lenses",
      message: "Need price details on blue cut progressive glasses.",
    },
    sampleResponse: {
      success: true,
      message: "Inquiry saved successfully.",
      id: 1,
    },
  },
  {
    id: "inquiries-get",
    method: "GET",
    path: "/api/inquiries",
    title: "Get Total Inquiries Count",
    description: "Fetches aggregate customer inquiry metrics.",
    requestBody: null,
    samplePayload: null,
    sampleResponse: {
      success: true,
      count: [{ total: 28 }],
    },
  },
];

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState(ENDPOINTS[0].id);
  const [copied, setCopied] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeEndpoint = ENDPOINTS.find((e) => e.id === activeTab) || ENDPOINTS[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const runTestRequest = async () => {
    setLoading(true);
    setTestResponse(null);
    try {
      const res = await fetch(activeEndpoint.path, {
        method: activeEndpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
        body:
          activeEndpoint.method === "POST" && activeEndpoint.samplePayload
            ? JSON.stringify(activeEndpoint.samplePayload)
            : undefined,
      });
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#0f1117] text-neutral-100 min-h-screen py-10 sm:py-16">
        <div className="container-brand max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-neutral-800 pb-6 space-y-3">
            <div className="flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
              <Database size={16} /> TiDB Cloud MySQL API Reference
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Darshana Optical API Documentation
            </h1>
            <p className="text-sm text-neutral-400 max-w-2xl font-medium">
              Interactive documentation for testing and integrating backend database endpoints for appointments and customer inquiries.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar List */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Available Endpoints
              </div>
              {ENDPOINTS.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    setActiveTab(ep.id);
                    setTestResponse(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeTab === ep.id
                      ? "bg-neutral-800/90 border-brand-orange text-white shadow-md shadow-brand-orange/10"
                      : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="text-xs font-bold text-white">{ep.title}</div>
                    <div className="text-[11px] font-mono text-neutral-400">{ep.path}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                      ep.method === "POST"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {ep.method}
                  </span>
                </button>
              ))}
            </div>

            {/* Endpoint Detail & Interactive Console */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-8 space-y-6">
                {/* Method & Path Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${
                          activeEndpoint.method === "POST"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {activeEndpoint.method}
                      </span>
                      <code className="text-sm sm:text-base font-mono font-bold text-neutral-100">
                        {activeEndpoint.path}
                      </code>
                    </div>
                    <p className="text-xs text-neutral-400 pt-1">{activeEndpoint.description}</p>
                  </div>

                  <button
                    onClick={runTestRequest}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-orange-hover transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span>Executing...</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Live Test</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Request Payload */}
                {activeEndpoint.samplePayload && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Request Body (JSON)
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(activeEndpoint.samplePayload, null, 2),
                            "req"
                          )
                        }
                        className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copied === "req" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copied === "req" ? "Copied" : "Copy Payload"}</span>
                      </button>
                    </div>
                    <pre className="rounded-xl bg-neutral-950 p-4 text-xs font-mono text-emerald-300 overflow-x-auto border border-neutral-800">
                      {JSON.stringify(activeEndpoint.samplePayload, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Live Output or Sample Response */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {testResponse ? "Live API Server Response" : "Expected Response Schema"}
                    </span>
                    {testResponse && (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={13} /> HTTP 200 OK
                      </span>
                    )}
                  </div>
                  <pre className="rounded-xl bg-neutral-950 p-4 text-xs font-mono text-amber-300 overflow-x-auto border border-neutral-800">
                    {testResponse || JSON.stringify(activeEndpoint.sampleResponse, null, 2)}
                  </pre>
                </div>

                {/* cURL Example */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Terminal size={14} /> cURL Command
                    </span>
                    <button
                      onClick={() => {
                        const curlCmd =
                          activeEndpoint.method === "POST"
                            ? `curl -X POST https://darshanaoptical.com${activeEndpoint.path} \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(activeEndpoint.samplePayload)}'`
                            : `curl -X GET https://darshanaoptical.com${activeEndpoint.path}`;
                        handleCopy(curlCmd, "curl");
                      }}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copied === "curl" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copied === "curl" ? "Copied" : "Copy cURL"}</span>
                    </button>
                  </div>
                  <pre className="rounded-xl bg-neutral-950 p-4 text-xs font-mono text-neutral-300 overflow-x-auto border border-neutral-800">
                    {activeEndpoint.method === "POST"
                      ? `curl -X POST https://darshanaoptical.com${activeEndpoint.path} \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(activeEndpoint.samplePayload)}'`
                      : `curl -X GET https://darshanaoptical.com${activeEndpoint.path}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
