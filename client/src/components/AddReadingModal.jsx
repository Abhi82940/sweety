import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Droplets, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTodayString, getGlucoseCategory } from '../utils/helpers';
import api from '../services/api';

const TIME_SLOTS = [
  { id: 'Morning (fasting)', label: 'Morning (fasting)', desc: 'Before breakfast / fasting' },
  { id: 'After breakfast', label: 'After breakfast', desc: '1-2 hours post breakfast' },
  { id: 'After lunch', label: 'After lunch', desc: '1-2 hours post lunch' },
  { id: 'After dinner', label: 'After dinner', desc: '1-2 hours post dinner' }
];

const AddReadingModal = ({ isOpen, onClose, onReadingSaved, initialData = null }) => {
  const [readingDate, setReadingDate] = useState(getTodayString());
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].id);
  const [glucoseValue, setGlucoseValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEdit = Boolean(initialData && initialData.id);

  useEffect(() => {
    if (initialData) {
      setReadingDate(initialData.reading_date || getTodayString());
      setTimeSlot(initialData.time_slot || TIME_SLOTS[0].id);
      setGlucoseValue(String(initialData.glucose_value || ''));
      setErrorMessage('');
    } else {
      setReadingDate(getTodayString());
      setTimeSlot(TIME_SLOTS[0].id);
      setGlucoseValue('');
      setErrorMessage('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const todayStr = getTodayString();
  const category = glucoseValue ? getGlucoseCategory(Number(glucoseValue), timeSlot) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Rule 1: Value is required
    if (!glucoseValue || glucoseValue.trim() === '') {
      setErrorMessage('Please enter a glucose value.');
      return;
    }

    // Rule 2: Whole number between 40 and 600
    const num = Number(glucoseValue);
    if (isNaN(num) || !Number.isInteger(num) || glucoseValue.includes('.') || num < 40 || num > 600) {
      setErrorMessage('Value must be between 40 and 600 mg/dl.');
      return;
    }

    // Rule 5: Date cannot be in the future
    if (readingDate > todayStr) {
      setErrorMessage('Date cannot be in the future.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/readings/${initialData.id}`, {
          reading_date: readingDate,
          time_slot: timeSlot,
          glucose_value: num
        });
      } else {
        await api.post('/readings', {
          reading_date: readingDate,
          time_slot: timeSlot,
          glucose_value: num
        });
      }

      onReadingSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save glucose reading.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 px-6 py-5 border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEdit ? 'Edit Glucose Reading' : 'Log Blood Glucose'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update your recorded entry' : 'Record a new daily measurement'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Reading Date
            </label>
            <div className="relative">
              <input
                type="date"
                max={todayStr}
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all outline-hidden text-slate-800 font-medium"
              />
              <Calendar className="w-4 h-4 text-purple-600 absolute left-3.5 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Date cannot be in the future.</p>
          </div>

          {/* Time Slot Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Time Slot
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TIME_SLOTS.map((slot) => {
                const selected = timeSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setTimeSlot(slot.id)}
                    className={`flex flex-col text-left p-3 rounded-xl border text-sm transition-all cursor-pointer ${
                      selected
                        ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`font-semibold text-xs ${selected ? 'text-purple-900' : 'text-slate-800'}`}>
                        {slot.label}
                      </span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5">{slot.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glucose Value Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Blood Glucose Value (mg/dl)
            </label>
            <div className="relative">
              <input
                type="number"
                min="40"
                max="600"
                step="1"
                placeholder="e.g. 110"
                value={glucoseValue}
                onChange={(e) => setGlucoseValue(e.target.value)}
                className="w-full px-4 py-3 text-lg font-bold bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all outline-hidden text-slate-900 placeholder:text-slate-300"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                mg/dl
              </span>
            </div>

            {/* Live Indicator */}
            {category && (
              <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl border bg-slate-50">
                <span className="text-xs text-slate-600 font-medium">Estimated Status:</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${category.bg}`}
                >
                  {category.label}
                </span>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Acceptable range: 40 to 600 mg/dl.</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-200 hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Update Reading' : 'Save Reading'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReadingModal;
