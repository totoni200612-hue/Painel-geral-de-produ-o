import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  variant = 'neutral',
  trend,
  onClick,
}) => {
  const getAccentBorder = () => {
    switch (variant) {
      case 'info': return 'border-l-4 border-l-blue-600';
      case 'success': return 'border-l-4 border-l-emerald-600';
      case 'warning': return 'border-l-4 border-l-amber-500';
      case 'danger': return 'border-l-4 border-l-rose-600';
      default: return 'border-l-4 border-l-slate-400';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'success': return 'text-emerald-600 bg-emerald-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'danger': return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-lg p-4 transition-all ${getAccentBorder()} ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`p-2 rounded-md ${getIconColor()}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
      </div>

      {(subtext || trend) && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtext}</span>
          {trend && (
            <span className={`font-mono font-medium tabular-nums ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
