import React from 'react';
import { Sun, Coffee, Utensils, Moon, Plus, Edit2, CheckCircle2 } from 'lucide-react';
import { getGlucoseCategory } from '../utils/helpers';

const SLOT_CONFIG = {
  'Morning (fasting)': {
    icon: Sun,
    color: 'from-amber-400 to-orange-400',
    border: 'border-amber-200/60',
    lightBg: 'bg-amber-50/50',
    target: 'Target: 70 - 99 mg/dl'
  },
  'After breakfast': {
    icon: Coffee,
    color: 'from-teal-400 to-cyan-500',
    border: 'border-teal-200/60',
    lightBg: 'bg-teal-50/50',
    target: 'Target: < 140 mg/dl'
  },
  'After lunch': {
    icon: Utensils,
    color: 'from-blue-400 to-indigo-500',
    border: 'border-blue-200/60',
    lightBg: 'bg-blue-50/50',
    target: 'Target: < 140 mg/dl'
  },
  'After dinner': {
    icon: Moon,
    color: 'from-purple-400 to-violet-500',
    border: 'border-purple-200/60',
    lightBg: 'bg-purple-50/50',
    target: 'Target: < 140 mg/dl'
  }
};

const SlotCard = ({ slotName, reading, onAddSlot, onEditSlot }) => {
  const config = SLOT_CONFIG[slotName] || {
    icon: Sun,
    color: 'from-purple-400 to-indigo-500',
    border: 'border-purple-200',
    lightBg: 'bg-purple-50',
    target: 'Standard Range'
  };

  const Icon = config.icon;
  const category = reading ? getGlucoseCategory(reading.glucose_value, slotName) : null;

  return (
    <div
      className={`relative rounded-3xl p-5 border transition-all duration-200 ${
        reading
          ? 'bg-white border-purple-100 shadow-sm hover:shadow-md'
          : `${config.lightBg} border-dashed ${config.border} hover:bg-white/80`
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${config.color} text-white flex items-center justify-center shadow-xs`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 leading-tight">{slotName}</h4>
            <span className="text-[10px] text-slate-400 font-medium">{config.target}</span>
          </div>
        </div>

        {reading && (
          <button
            onClick={() => onEditSlot(reading)}
            title="Edit reading"
            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      {reading ? (
        <div className="space-y-2 mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {reading.glucose_value}
            </span>
            <span className="text-xs font-semibold text-slate-400">mg/dl</span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${category.bg}`}
            >
              {category.label}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Recorded
            </span>
          </div>
        </div>
      ) : (
        <div className="py-2.5 text-center">
          <p className="text-xs text-slate-400 mb-3 font-medium">No reading logged</p>
          <button
            onClick={() => onAddSlot(slotName)}
            className="w-full py-2 px-3 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Slot</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SlotCard;
