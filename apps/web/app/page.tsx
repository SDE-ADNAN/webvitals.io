export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          WebVitals.io
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-400">
          Real-Time Web Performance Monitoring
        </p>
        <p className="mt-6 text-lg text-gray-500 dark:text-gray-500">
          Track Core Web Vitals without the enterprise overhead
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            Project Initialized ✓
          </div>
        </div>
        <p className="mt-8 text-sm text-gray-400">
          Milestone 1.1 Complete - Ready for development
        </p>
      </div>
    </main>
  );
}
