'use client';

import dynamic from 'next/dynamic';
import { HelmetProvider } from 'react-helmet-async';
import { Suspense } from 'react';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <div className="text-center px-4">
        <div className="text-2xl font-bold mb-4 text-blue-600">Knowledge Base</div>
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-slate-500">Đang tải...</p>
      </div>
    </div>
  );
}

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: LoadingFallback,
});

export function ClientOnly() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Suspense>
  );
}
