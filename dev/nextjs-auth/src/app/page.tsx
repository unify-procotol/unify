"use client";

import { repo } from "@unilab/urpc";
import { initUrpcClient } from "@/lib/urpc-client";
import { useEffect, useState } from "react";
import authClient from "@/lib/auth-client";

initUrpcClient();

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    setTimeout(() => {
      authClient.organization.list().then((res) => {
        if (res.data) {
          authClient.organization.setActive({
            organizationId: res.data[0].id,
          });
        }
      });
    }, 1000);
  }, []);

  const handleGetPosts = async () => {
    setLoading(true);
    setResult("");

    try {
      const posts = await repo({
        entity: "post",
        source: "ghost",
      }).findOne({
        where: {
          slug: "hello-world",
        },
      });
      console.log("Unexpected success:", posts);
      setResult(`Success: ${JSON.stringify(posts, null, 2)}`);
    } catch (error: any) {
      console.log("Expected error:", error.message);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white">
      {/* Background decoration effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/3 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            URPC + BetterAuth
          </h1>
          <div className="text-lg mb-3 bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent font-light">
            Next.js Authentication System
          </div>
          <p className="text-base max-w-3xl mx-auto text-slate-300 leading-relaxed font-light">
            Experience the modern URPC authentication system - secure, fast, and
            elegant data querying experience
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 hover:border-blue-500/50 transition-colors duration-300">
            {/* Code Example Section */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50">
              <div className="flex items-center">
                <div className="flex space-x-2 mr-4">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  URPC API Query Example
                </h2>
                <div className="ml-auto px-2 py-1 bg-slate-700/50 rounded-md text-xs text-slate-400 font-mono">
                  TypeScript
                </div>
              </div>
            </div>

            <div className="p-6">
              <pre className="text-sm overflow-x-auto p-6 rounded-xl bg-slate-800/50 border border-slate-600/30 text-slate-200 font-mono leading-relaxed mb-6">
                <code className="text-slate-200">
                  {`try {
  const posts = await repo({
    entity: "post",
    source: "ghost",
  }).findOne({
    where: {
      slug: "hello-world",
    },
  });
  console.log("Success:", posts);
} catch (error: any) {
  console.log("Error:", error.message);
}`}
                </code>
              </pre>

              {/* Action Section */}
              <div className="text-center py-6 border-t border-slate-700/50">
                <button
                  onClick={handleGetPosts}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 font-semibold text-sm rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      <span>Executing...</span>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Execute Query</span>
                    </>
                  )}
                </button>
              </div>

              {/* Result Section */}
              {result && (
                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-3 shadow-md">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Execution Result
                    </span>
                  </h3>

                  <div
                    className={`p-4 rounded-lg border-l-4 ${
                      result.startsWith("Error:")
                        ? "bg-red-950/50 border-red-500 text-red-200"
                        : "bg-green-950/50 border-green-500 text-green-200"
                    } shadow-lg backdrop-blur-sm`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-4 h-4 rounded-full mr-3 mt-0.5 flex-shrink-0 ${
                          result.startsWith("Error:")
                            ? "bg-red-500"
                            : "bg-green-500"
                        } shadow-md`}
                      ></div>
                      <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed flex-1">
                        {result}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
