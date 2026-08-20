'use client'

import Link from 'next/link'
import { AlertTriangle, Settings } from 'lucide-react'

interface AdminMaintenanceBannerProps {
  isEnvOverride?: boolean
}

export default function AdminMaintenanceBanner({ isEnvOverride }: AdminMaintenanceBannerProps) {
  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-medium px-4 py-2.5 shadow-md sticky top-0 z-[100] text-xs sm:text-sm border-b border-amber-400">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-stone-950 flex-shrink-0" />
          <span>
            <strong>Modalità Manutenzione ATTIVA:</strong> Stai visualizzando il sito con privilegi di <em>Amministratore</em>. I normali visitatori vedono la pagina di manutenzione.
            {isEnvOverride && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-800 text-amber-100 rounded text-[11px]">
                ENV Override
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 px-3 py-1 bg-stone-950 text-amber-400 rounded-md font-semibold text-xs hover:bg-stone-900 transition-colors shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gestisci nel Pannello Admin</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
