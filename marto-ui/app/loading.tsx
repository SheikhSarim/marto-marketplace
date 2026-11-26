import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-surface-page flex items-center justify-center p-6">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading Marto Marketplace...</span>
      </div>
    </div>
  );
}
