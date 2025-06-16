import Link from "next/link";
import { ArrowRight, Code, Zap, Shield, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col justify-center items-center text-center px-4 py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-8">
              <Zap className="w-4 h-4" />
              Modern API Development Framework
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Unify
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            Powerful SDK based on Hono
          </p>

          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Seamlessly map entity configurations to REST API
            endpoints, providing type-safe, high-performance backend solutions for modern applications
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/docs/installation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/docs/introduction"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
            >
              <Code className="w-4 h-4" />
              API Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Unify API?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Modern architectural design that makes API development simple and efficient
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                High Performance
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built on Hono, providing ultimate runtime performance with minimal resource consumption
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Type Safety
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete TypeScript support with compile-time error checking to ensure code quality
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Flexible Configuration
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automatically generate REST APIs through simple entity configuration, supporting complex business logic
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Simple and Easy-to-Use API
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create complete REST API endpoints with just a few lines of code
            </p>
          </div>

          <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-4 text-gray-400 text-sm">server.ts</span>
            </div>
            <pre className="text-green-400 text-sm overflow-x-auto">
              {`import { createSource } from "@unify/server";
import { SolanaPlugin, EVMPlugin } from "@unify/uniweb3";

const source = createSource();

source.register([EVMPlugin, SolanaPlugin]);

const app = source.getApp();

console.log(
  app.routes.map((route) => \`- \${route.method} \${route.path}\`).join("\\n")
);

export default {
  port: 3000,
  fetch: app.fetch,
};`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
