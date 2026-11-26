'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-page text-on-surface min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">Application Error</h1>
          <p className="text-sm text-slate-600 mt-2">
            {error.message || 'A fatal rendering error occurred.'}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
