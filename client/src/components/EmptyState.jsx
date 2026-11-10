import React from 'react';
import { Droplets, Plus } from 'lucide-react';

const EmptyState = ({
  title = 'No readings recorded yet',
  description = 'Start tracking your blood glucose to see clinical trends and reports.',
  actionText = 'Add Reading',
  onAction,
  icon: Icon = Droplets
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-3xl bg-white/60 border border-dashed border-purple-200">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
