"use client";
import React from "react";
import authClient from "@/lib/auth-client";

const SocialIcons = {
  github: GithubIcon,
  google: GoogleIcon,
};

export default function SignIn() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/20 p-8 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg">
                <img src="/vercel.svg" className="w-8 h-8" alt="Logo" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Sign in to continue to your account
              </p>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-4">
            {["github", "google"].map((provider) => {
              const Icon = SocialIcons[provider as keyof typeof SocialIcons];
              const providerConfig = {
                github: {
                  name: "GitHub",
                  bgColor: "bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600",
                  textColor: "text-white",
                  borderColor: "border-slate-900 dark:border-slate-700"
                },
                google: {
                  name: "Google",
                  bgColor: "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700",
                  textColor: "text-slate-900 dark:text-white",
                  borderColor: "border-slate-300 dark:border-slate-600"
                }
              };
              
              const config = providerConfig[provider as keyof typeof providerConfig];
              
              return (
                <button
                  key={provider}
                  className={`w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-xl border-2 ${config.bgColor} ${config.textColor} ${config.borderColor} transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 group`}
                  onClick={async () => {
                    const queryString = window.location.search;
                    const urlParams = new URLSearchParams(queryString);
                    const redirect = urlParams.get("redirect");
                    await authClient.signIn.social({
                      provider: provider as "github" | "google",
                      callbackURL: redirect || `/`,
                    });
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">
                    Continue with {config.name}
                  </span>
                  <svg 
                    className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Security Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Secure Authentication
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            By signing in, you agree to our{" "}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function GithubIcon({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="fill-current"
      width={size}
      height={size}
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function GoogleIcon({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="fill-current"
      width={size}
      height={size}
    >
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}
