import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bell,
  Gauge,
  LineChart,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-3">
            <Activity className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              WebVitals.io
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl sm:text-3xl text-gray-600 dark:text-gray-300 font-medium">
            Real-Time Web Performance Monitoring
          </p>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Track Core Web Vitals without the enterprise overhead. Monitor LCP,
            FID, and CLS metrics in real-time with beautiful dashboards and
            instant alerts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Get Started Free
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              View Demo
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
            No credit card required • Free forever for indie developers
          </p>
        </div>

        {/* Features Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Everything you need to monitor performance
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Built for developers who care about user experience and want
            actionable insights without complexity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Real-Time Monitoring */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Gauge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Real-Time Metrics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor Core Web Vitals (LCP, FID, CLS) as they happen. See
                performance data update instantly with WebSocket connections.
              </p>
            </div>

            {/* Feature 2: Beautiful Dashboards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Beautiful Dashboards
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize performance trends with interactive charts. Filter by
                device type, browser, and time range to identify issues quickly.
              </p>
            </div>

            {/* Feature 3: Smart Alerts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Smart Alerts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get notified when metrics exceed thresholds. Configure alerts
                for email, Slack, or webhooks to stay informed.
              </p>
            </div>

            {/* Feature 4: Easy Integration */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Easy Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add one script tag to your site and start collecting metrics.
                Works with any framework or static site.
              </p>
            </div>

            {/* Feature 5: Historical Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Historical Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track performance over time with 90 days of data retention.
                Compare metrics across different time periods.
              </p>
            </div>

            {/* Feature 6: Developer Friendly */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Developer Friendly
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built by developers, for developers. Clean API, comprehensive
                docs, and open-source tracking script.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Start monitoring your site today
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join developers who trust WebVitals.io to keep their sites fast and
            their users happy.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get Started Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-24">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              © 2025 WebVitals.io. Built with Next.js 15, TypeScript, and
              Tailwind CSS.
            </p>
            <p className="text-xs mt-2">
              Week 1 Frontend Dashboard - Ready for Week 3 API Integration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
