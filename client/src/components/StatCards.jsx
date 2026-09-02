import React from 'react';
import { IndianRupee, CheckCircle2, AlertCircle, Percent } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const StatCards = ({ stats }) => {
  const cards = [
    {
      title: 'Gross Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      subtext: `${stats?.totalStudents || 0} Students`,
      icon: IndianRupee,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-900',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Collected',
      value: formatCurrency(stats?.totalCollected || 0),
      subtext: `${stats?.statusCounts?.PAID || 0} Cleared`,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'Pending Due',
      value: formatCurrency(stats?.totalBalance || 0),
      subtext: `${(stats?.statusCounts?.PARTIAL || 0) + (stats?.statusCounts?.PENDING || 0)} Pending`,
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
    {
      title: 'Recovery Rate',
      value: `${stats?.recoveryRate || 0}%`,
      subtext: 'Efficiency',
      icon: Percent,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-800',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border ${card.borderColor} shadow-2xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between gap-1.5 sm:gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate mb-0.5 sm:mb-1">
                  {card.title}
                </p>
                <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-slate-900 font-heading truncate">
                  {card.value}
                </h3>
              </div>
              <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl ${card.bgColor} ${card.iconColor} border ${card.borderColor} shrink-0`}>
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-1.5 font-medium truncate">
              {card.subtext}
            </p>
            <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-900 to-red-600" />
          </div>
        );
      })}
    </div>
  );
};
