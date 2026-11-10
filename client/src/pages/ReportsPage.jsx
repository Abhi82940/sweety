import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getTodayString, formatDisplayDate, exportToCsv } from '../utils/helpers';
import GlucoseBadge from '../components/GlucoseBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  FileBarChart2,
  Calendar,
  Download,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

const REPORT_TABS = [
  { id: 'daily', label: 'Daily Report', desc: 'Readings for the selected single date' },
  { id: 'month-to-date', label: 'Month-to-Date', desc: '1st of month to selected date inclusive' },
  { id: 'monthly', label: 'Previous Month', desc: 'Complete previous calendar month' }
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/reports/daily';
      if (activeTab === 'month-to-date') endpoint = '/reports/month-to-date';
      if (activeTab === 'monthly') endpoint = '/reports/monthly';

      const res = await api.get(`${endpoint}?date=${selectedDate}`);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCsv = () => {
    if (!reportData || !reportData.readings || reportData.readings.length === 0) return;
    const exportData = reportData.readings.map((r) => ({
      ReportType: activeTab,
      Date: r.reading_date,
      TimeSlot: r.time_slot,
      GlucoseValueMgDl: r.glucose_value
    }));
    exportToCsv(`sweety_${activeTab}_report_${selectedDate}`, exportData);
  };

  const readings = reportData?.readings || [];
  const trend = reportData?.trend || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileBarChart2 className="w-5 h-5" />
            </div>
            Clinical Glucose Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard medical reporting for daily, month-to-date, and previous calendar month metrics.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={!readings.length}
          className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-purple-600" />
          <span>Export Report CSV</span>
        </button>
      </div>

      {/* Tabs & Date Selector */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab buttons */}
          <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
            {REPORT_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-purple-900 shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-slate-600">Selected Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-hidden cursor-pointer"
              />
            </div>
            {selectedDate !== getTodayString() && (
              <button
                onClick={() => setSelectedDate(getTodayString())}
                className="px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100/80 rounded-2xl border border-purple-200 transition-colors cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Date Range explanation pill */}
        <div className="text-xs text-slate-500 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/60 flex items-center justify-between">
          <span className="font-medium">
            {activeTab === 'daily' && `Showing readings recorded on ${formatDisplayDate(selectedDate)}`}
            {activeTab === 'month-to-date' &&
              `Reporting range: ${formatDisplayDate(reportData?.startDate)} to ${formatDisplayDate(
                reportData?.endDate
              )} (Inclusive)`}
            {activeTab === 'monthly' &&
              `Previous Calendar Month: ${formatDisplayDate(
                reportData?.startDate
              )} to ${formatDisplayDate(reportData?.endDate)}`}
          </span>
          <span className="text-purple-700 font-semibold text-[11px]">
            {readings.length} reading{readings.length === 1 ? '' : 's'} included
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Calculating report analytics..." />
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Readings */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Readings</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {reportData?.total ?? 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">In selected period</p>
            </div>

            {/* Average Reading */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Average Glucose</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {reportData?.average !== null && reportData?.average !== undefined
                    ? reportData.average
                    : '--'}
                </span>
                <span className="text-xs font-medium text-slate-400">mg/dl</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Rounded to 1 decimal place</p>
            </div>

            {/* Highest Reading */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Highest Value</span>
                <ArrowUpRight className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-rose-600">
                  {reportData?.highest !== null && reportData?.highest !== undefined
                    ? reportData.highest
                    : '--'}
                </span>
                <span className="text-xs font-medium text-slate-400">mg/dl</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Peak measurement</p>
            </div>

            {/* Lowest Reading */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Lowest Value</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {reportData?.lowest !== null && reportData?.lowest !== undefined
                    ? reportData.lowest
                    : '--'}
                </span>
                <span className="text-xs font-medium text-slate-400">mg/dl</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Minimum measurement</p>
            </div>
          </div>

          {/* Visual Charts */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  {activeTab === 'daily' ? 'Daily Readings by Slot' : 'Glycemic Trend Curve'}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeTab === 'daily'
                    ? 'Comparing blood glucose values across four daily meals'
                    : 'Actual daily averages charted across the calendar range'}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Target: 70 - 140 mg/dl
                </span>
              </div>
            </div>

            {readings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No readings recorded for this report range.
              </div>
            ) : activeTab === 'daily' ? (
              // Bar chart for daily report
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={readings} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="time_slot" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[50, 'dataMax + 20']} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-2xl shadow-xl border border-purple-100 text-xs">
                              <p className="font-bold text-slate-900">{data.time_slot}</p>
                              <p className="text-purple-700 font-extrabold text-sm">
                                {data.glucose_value} mg/dl
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={140} stroke="#10b981" strokeDasharray="4 4" />
                    <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" />
                    <Bar
                      dataKey="glucose_value"
                      fill="#8b5cf6"
                      radius={[12, 12, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              // Area/Line chart for MTD and Previous Month
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.split('-').slice(1).join('/')}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis domain={[50, 'dataMax + 20']} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-2xl shadow-xl border border-purple-100 text-xs">
                              <p className="font-bold text-slate-900">{formatDisplayDate(data.date)}</p>
                              <p className="text-purple-700 font-bold">Average: {data.average} mg/dl</p>
                              <p className="text-slate-500">
                                High: {data.highest} | Low: {data.lowest}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {data.count} reading(s)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={140} stroke="#10b981" strokeDasharray="4 4" />
                    <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" />
                    <Area
                      type="monotone"
                      dataKey="average"
                      stroke="#7c3aed"
                      strokeWidth={2.5}
                      fill="url(#reportGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Daily Reading Details Table */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Detailed Readings Breakdown</h3>
              <p className="text-xs text-slate-500">
                Itemized log of every measurement counted in this report calculation.
              </p>
            </div>

            {readings.length === 0 ? (
              <EmptyState
                title="No reading details to display"
                description="There are no records for this timeframe."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      <th className="pb-3 px-4">Date</th>
                      <th className="pb-3 px-4">Time Slot</th>
                      <th className="pb-3 px-4">Glucose Reading</th>
                      <th className="pb-3 px-4">Clinical Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {readings.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {formatDisplayDate(r.reading_date)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{r.time_slot}</td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {r.glucose_value}
                          </span>{' '}
                          <span className="text-[10px] text-slate-400">mg/dl</span>
                        </td>
                        <td className="py-3 px-4">
                          <GlucoseBadge value={r.glucose_value} timeSlot={r.time_slot} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
