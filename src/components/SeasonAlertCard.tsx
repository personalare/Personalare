import React, { useState } from 'react';
import {
  CloudRain,
  Umbrella,
  AlertTriangle,
  Calendar,
  Sparkles,
  Car,
  Waves,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  ThermometerSnowflake,
} from 'lucide-react';
import { VagamonSeasonAlert } from '../utils/vagamonSeasons';

interface SeasonAlertCardProps {
  alert: VagamonSeasonAlert;
  acknowledged?: boolean;
  onToggleAcknowledge?: () => void;
  compact?: boolean;
  variant?: 'prominent' | 'summary';
}

export const SeasonAlertCard: React.FC<SeasonAlertCardProps> = ({
  alert,
  acknowledged = false,
  onToggleAcknowledge,
  compact = false,
  variant = 'prominent',
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const isMonsoon = alert.type === 'monsoon' || alert.type === 'both';
  const isFestival = alert.type === 'festival' || alert.type === 'both';

  // Card themes: Rainy seasons get a clean mountain-rain deep slate & blue/amber styling; festivals get warm emerald/gold.
  const theme = isMonsoon
    ? {
        border: 'border-blue-200 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50',
        badgeBg: 'bg-blue-100/90 text-blue-900 border-blue-300',
        iconBg: 'bg-blue-600 text-white',
        accentText: 'text-blue-950',
        headerIcon: <CloudRain className="w-4 h-4 text-blue-700 animate-pulse" />,
      }
    : {
        border: 'border-amber-200 bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-white',
        badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-300',
        iconBg: 'bg-amber-600 text-white',
        accentText: 'text-amber-950',
        headerIcon: <Sparkles className="w-4 h-4 text-amber-700" />,
      };

  if (variant === 'summary') {
    return (
      <div className={`rounded-2xl border p-4 shadow-xs transition-all ${theme.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-white shadow-xs border border-gray-100 shrink-0 mt-0.5">
              {isMonsoon ? (
                <CloudRain className="w-4 h-4 text-blue-700" />
              ) : (
                <Calendar className="w-4 h-4 text-amber-700" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.badgeBg}`}>
                  {alert.badge}
                </span>
                {acknowledged && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Acknowledged
                  </span>
                )}
              </div>
              <h5 className="font-serif text-sm font-bold text-gray-900 mt-1">
                {alert.title}
              </h5>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                {alert.headline}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-semibold shrink-0 cursor-pointer pt-1"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Tips'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200/70 space-y-2 text-xs text-gray-700">
            <div className="p-2.5 rounded-xl bg-white/80 border border-gray-200/80">
              <strong className="text-gray-900 block font-semibold mb-0.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-800" /> Travel & Road Tip:
              </strong>
              <span>{alert.drivingAdvisory}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-gray-200/80">
              <strong className="text-gray-900 block font-semibold mb-0.5 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-blue-700" /> Private Pool:
              </strong>
              <span>{alert.poolAdvisory}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-all relative overflow-hidden ${theme.border}`}
      id="vagamon-seasonal-alert-card"
    >
      {/* Top Banner Alert Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/70">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white shadow-xs border border-gray-200 text-gray-900 shrink-0">
            {theme.headerIcon}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${theme.badgeBg}`}
              >
                {alert.badge}
              </span>
              {alert.liveForecastNote && (
                <span className="text-[10px] font-bold text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-blue-700" /> Live Weather Sync
                </span>
              )}
            </div>
            <h4 className="font-serif text-base sm:text-lg font-bold text-gray-900 mt-0.5">
              {alert.title}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start sm:self-auto px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
        >
          <span>{isExpanded ? 'Collapse Advisory' : 'Expand Season Guide'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Notice Headline */}
      <div className="pt-3 space-y-2">
        <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
          {alert.headline}
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">
          {alert.description}
        </p>

        {alert.liveForecastNote && (
          <div className="p-2.5 bg-blue-100/70 border border-blue-300 rounded-xl text-xs text-blue-950 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <span className="font-medium">{alert.liveForecastNote}</span>
          </div>
        )}
      </div>

      {/* Expandable Deep Advisory Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200/70 space-y-4">
          {/* Matched Seasons Breakdown */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-800" />
              <span>Active Seasonal Characteristics in Vagamon</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {alert.matchedSeasons.map((season) => (
                <div
                  key={season.id}
                  className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{season.name}</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                      {season.tag}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-emerald-800">
                    {season.dateRangeDescription}
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    {season.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Mountain Advisories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Driving & Arrival Notice */}
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <Car className="w-4 h-4 text-emerald-800" />
                <span>Mountain Ghat Road Navigation</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {alert.drivingAdvisory}
              </p>
            </div>

            {/* Infinity Pool Advisory */}
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <Waves className="w-4 h-4 text-blue-700" />
                <span>Private Cliffside Infinity Pool</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {alert.poolAdvisory}
              </p>
            </div>
          </div>

          {/* What to Pack & Villa Readiness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Packing Checklist */}
            <div className="p-3.5 bg-white/90 border border-gray-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <Umbrella className="w-4 h-4 text-indigo-700" />
                <span>Recommended to Pack for this Season</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5">
                {alert.packingList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Villa Weather Readiness */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>Cloud Heaven Villa All-Weather Guarantees</span>
              </div>
              <ul className="text-xs text-emerald-900/80 space-y-1.5">
                {alert.villaReadiness.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Acknowledgement Action Button */}
          {onToggleAcknowledge && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/70 border border-gray-200 rounded-xl p-3">
              <div className="text-xs text-gray-600">
                {acknowledged ? (
                  <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    You have acknowledged this Vagamon seasonal advisory.
                  </span>
                ) : (
                  <span>
                    Please acknowledge the seasonal weather &amp; mountain road advisory to proceed smoothly.
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onToggleAcknowledge}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  acknowledged
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                    : 'bg-emerald-900 text-white hover:bg-emerald-800 shadow-xs'
                }`}
              >
                {acknowledged ? 'Advisory Acknowledged ✓' : 'I Understand & Acknowledge'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
