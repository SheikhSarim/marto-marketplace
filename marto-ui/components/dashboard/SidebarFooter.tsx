'use client';

import React from 'react';
import { UserProfileMenu } from './UserProfileMenu';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { ShieldCheck } from 'lucide-react';

interface SidebarFooterProps {
  isCollapsed?: boolean;
  customUsageCard?: React.ReactNode;
  showUsageCard?: boolean;
}

export function SidebarFooter({
  isCollapsed = false,
  customUsageCard,
  showUsageCard = true,
}: SidebarFooterProps) {
  return (
    <div className="mt-auto pt-3 border-t border-white/10 space-y-2.5">
      {showUsageCard && (
        <>
          {customUsageCard ? (
            customUsageCard
          ) : isCollapsed ? (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-teal-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  <div className="font-semibold">Single-Seller Enforcement</div>
                  <div className="text-[10px] opacity-80">BR-08 Active</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-teal-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Governance Mode</span>
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-teal-400/15 text-teal-200 border border-teal-400/20">
                  BR-08
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Single-seller order isolation active.
              </p>
            </div>
          )}
        </>
      )}

      <UserProfileMenu isCollapsed={isCollapsed} />
    </div>
  );
}
