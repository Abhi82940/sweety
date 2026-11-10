import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getTodayString, formatDisplayDate } from '../utils/helpers';
import SlotCard from '../components/SlotCard';
import AddReadingModal from '../components/AddReadingModal';
import LoadingSpinner from '../components/LoadingSpinner';
import GlucoseBadge from '../components/GlucoseBadge';
import {
  Calendar,
  PlusCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  History,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

const SLOTS_LIST = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner'
];

const DashboardPage = () => {
  const { user } = useAuth();
  const { refreshTrigger, onOpenAddModal } = useOutletContext() || {};

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [dailyData, setDailyData] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch daily report for selected date
      const dailyRes = await api.get(`/reports/daily?date=${selectedDate}`);

      // 2. Fetch month-to-date or monthly report for trend chart
      const monthlyRes = await api.get(`/reports/month-to-date?date=${selectedDate}`);

      // 3. Fetch recent 6 readings
      const recentRes = await api.get('/readings?limit=6');

      setDailyData(dailyRes.data);
      setMonthlyTrend(monthlyRes.data?.trend || []);
      setRecentReadings(recentRes.data?.readings || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshTrigger]);

  const handleOpenAddSlot = (slotName) => {
    setModalInitialData({
      reading_date: selectedDate,
      time_slot: slotName,
      glucose_value: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (reading) => {
    setModalInitialData(reading);
    setModalOpen(true);
  };

  const dailyReadings = dailyData?.readings || [];
  const latestReading = dailyReadings.length > 0 ? dailyReadings[dailyReadings.length - 1] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Date Bar */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute right-0 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-medium mb-3 backdrop-blur-xs">
            <Activity className="w-3.5 h-3.5 text-pink-300" />
            <span>Daily Health Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Patient'}!
          </h1>
          <p className="text-purple-100/90 text-sm mt-1 max-w-md">
            Track your four daily glucose slots and monitor your glycemic trends.
          </p>
        </div>

        {/* Selected Date Picker and Quick Action */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/15 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
            <Calendar className="w-4 h-4 text-purple-200 ml-2.5 mr-2" />
            <input
              type="date"
              max={getTodayString()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-hidden cursor-pointer"
            />
            {selectedDate !== getTodayString() && (
              <button
                onClick={() => setSelectedDate(getTodayString())}
                className="ml-2 px-2.5 py-1 text-[11px] font-bold bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setModalInitialData({ reading_date: selectedDate });
              setModalOpen(true);
            }}
            className="px-5 py-2.5 text-xs font-bold text-purple-950 bg-white hover:bg-purple-50 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>Add Reading</span>
          </button>
        </div>
      </div>

      {loading && !dailyData ? (
        <LoadingSpinner text="Fetching your daily glucose readings..." />
      ) : (
        <>
          {/* Top 5 Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Readings Today */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Today</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {dailyData?.total ?? 0}
                </span>
                <span className="text-xs font-medium text-slate-400">/ 4 slots</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {dailyData?.total === 4
                  ? 'All 4 daily slots logged 🎉'
                  : `${4 - (dailyData?.total || 0)} slots remaining`}
              </p>
            </div>

            {/* Latest Reading */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Latest Value</span>
                <Activity className="w-4 h-4 text-pink-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {latestReading ? latestReading.glucose_value : '--'}
                </span>
                <span className="text-xs font-medium text-slate-400">mg/dl</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 truncate">
                {latestReading ? latestReading.time_slot : 'No readings yet'}
              </div>
            </div>

            {/* Average Glucose */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Daily Average</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {dailyData?.average !== null && dailyData?.average !== undefined
                    ? dailyData.average
                    : '--'}
                </span>
                <span className="text-xs font-medium text-slate-400">mg/dl</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Rounded to 1 decimal</p>
            </div>

            {/* Highest Reading */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Highest</span>
                <ArrowUpRight className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                  {dailyData?.highest !== null && dailyData?.highest !== undefined
                    ? dailyData.highest
                    : '--'}
                </span>
                <span className="text-xs font-medium text-slate-400">mg/dl</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Peak glucose for day</p>
            </div>

            {/* Lowest Reading */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs hover:shadow-md transition-all col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Lowest</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {dailyData?.lowest !== null && dailyData?.lowest !== undefined
                    ? dailyData.lowest
                    : '--'}
                </span>
                <span className="text-xs font-medium text-slate-400">mg/dl</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Minimum glucose for day</p>
            </div>
          </div>

          {/* Section: Four Daily Reading Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Daily Slots for {formatDisplayDate(selectedDate)}
                </h3>
                <p className="text-xs text-slate-500">
                  Record each of the 4 clinical slots. Max 1 reading per slot per day.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {dailyReadings.length} / 4 Recorded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SLOTS_LIST.map((slotName) => {
                const readingForSlot = dailyReadings.find((r) => r.time_slot === slotName);
                return (
                  <SlotCard
                    key={slotName}
                    slotName={slotName}
                    reading={readingForSlot}
                    onAddSlot={handleOpenAddSlot}
                    onEditSlot={handleOpenEdit}
                  />
                );
              })}
            </div>
          </div>

          {/* Section: Monthly Glucose Trend Chart */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Month-to-Date Glucose Trend
                </h3>
                <p className="text-xs text-slate-500">
                  Visual daily averages from 1st of month through selected date.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  Daily Average (mg/dl)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500" />
                  Target Zone (70-140)
                </span>
              </div>
            </div>

            {monthlyTrend.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyTrend}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
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
                    <YAxis
                      domain={[50, 'dataMax + 30']}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-purple-100 text-xs">
                              <p className="font-bold text-slate-800 mb-1">
                                {formatDisplayDate(data.date)}
                              </p>
                              <p className="text-purple-700 font-semibold">
                                Average: {data.average} mg/dl
                              </p>
                              <p className="text-slate-500">
                                High: {data.highest} | Low: {data.lowest}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {data.count} readings recorded
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
                      fillOpacity={1}
                      fill="url(#purpleGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No readings recorded in this month yet. Log readings above to view the trend chart.
              </div>
            )}
          </div>

          {/* Section: Recent Readings Table */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  Recent Glucose Readings
                </h3>
                <p className="text-xs text-slate-500">Your latest logged measurements across dates.</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline"
              >
                View Full History &rarr;
              </Link>
            </div>

            {recentReadings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Time Slot</th>
                      <th className="pb-3 px-3">Value</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {recentReadings.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {formatDisplayDate(r.reading_date)}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{r.time_slot}</td>
                        <td className="py-3 px-3">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {r.glucose_value}
                          </span>{' '}
                          <span className="text-[10px] text-slate-400">mg/dl</span>
                        </td>
                        <td className="py-3 px-3">
                          <GlucoseBadge value={r.glucose_value} timeSlot={r.time_slot} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="text-purple-600 hover:text-purple-800 font-semibold cursor-pointer text-xs"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent readings found. Click "Add Reading" to begin tracking.
              </div>
            )}
          </div>
        </>
      )}

      {/* Add / Edit Reading Modal */}
      <AddReadingModal
        isOpen={modalOpen}
        initialData={modalInitialData}
        onClose={() => {
          setModalOpen(false);
          setModalInitialData(null);
        }}
        onReadingSaved={fetchDashboardData}
      />
    </div>
  );
};

export default DashboardPage;
