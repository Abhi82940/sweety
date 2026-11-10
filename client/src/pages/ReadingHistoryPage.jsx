import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { formatDisplayDate, exportToCsv } from '../utils/helpers';
import GlucoseBadge from '../components/GlucoseBadge';
import AddReadingModal from '../components/AddReadingModal';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  History,
  Calendar,
  Filter,
  Download,
  PlusCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const ReadingHistoryPage = () => {
  const { refreshTrigger } = useOutletContext() || {};

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterSlot, setFilterSlot] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/readings?page=${page}&limit=${limit}`;
      if (filterDate) {
        url += `&date=${filterDate}`;
      }

      const res = await api.get(url);
      let list = res.data.readings || [];

      // Filter by slot on client if selected
      if (filterSlot) {
        list = list.filter((r) => r.time_slot === filterSlot);
      }

      setReadings(list);
      setPagination(res.data.pagination || { total: list.length, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load readings history:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterDate, filterSlot]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings, refreshTrigger]);

  const handleEditClick = (reading) => {
    setSelectedReading(reading);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (reading) => {
    setReadingToDelete(reading);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!readingToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/readings/${readingToDelete.id}`);
      setDeleteModalOpen(false);
      setReadingToDelete(null);
      fetchReadings();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.message || 'Failed to delete reading.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      // Fetch all readings without pagination limit
      const res = await api.get('/readings?limit=1000');
      const allReadings = res.data.readings || [];
      const exportData = allReadings.map((r) => ({
        ID: r.id,
        Date: r.reading_date,
        TimeSlot: r.time_slot,
        GlucoseValueMgDl: r.glucose_value,
        RecordedAt: r.created_at
      }));
      exportToCsv(`sweety_glucose_history_${Date.now()}`, exportData);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            Glucose Reading History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, edit, delete, or export your complete blood glucose log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setSelectedReading(null);
              setEditModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Reading</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-purple-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-slate-600">Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
            />
            {filterDate && (
              <button
                onClick={() => {
                  setFilterDate('');
                  setPage(1);
                }}
                className="text-[10px] text-slate-400 hover:text-slate-700 font-bold ml-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Time Slot Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-slate-600">Slot:</span>
            <select
              value={filterSlot}
              onChange={(e) => setFilterSlot(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All Time Slots</option>
              <option value="Morning (fasting)">Morning (fasting)</option>
              <option value="After breakfast">After breakfast</option>
              <option value="After lunch">After lunch</option>
              <option value="After dinner">After dinner</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing {readings.length} of {pagination.total} records
        </div>
      </div>

      {/* Main Table / List */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading reading records..." />
        ) : readings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No readings found"
              description={
                filterDate || filterSlot
                  ? 'No records matched your selected filters. Try clearing them.'
                  : 'You have not added any blood glucose readings yet.'
              }
              actionText="Log New Reading"
              onAction={() => {
                setSelectedReading(null);
                setEditModalOpen(true);
              }}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-purple-50/50 border-b border-purple-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-4 px-6">Reading Date</th>
                    <th className="py-4 px-6">Clinical Time Slot</th>
                    <th className="py-4 px-6">Glucose Value</th>
                    <th className="py-4 px-6">Clinical Evaluation</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {readings.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-purple-50/30 transition-colors group"
                    >
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {formatDisplayDate(r.reading_date)}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {r.time_slot}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-extrabold text-slate-900">
                            {r.glucose_value}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">mg/dl</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <GlucoseBadge value={r.glucose_value} timeSlot={r.time_slot} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(r)}
                            title="Edit reading"
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(r)}
                            title="Delete reading"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Page <span className="font-bold text-slate-800">{page}</span> of{' '}
                  <span className="font-bold text-slate-800">{pagination.totalPages}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Reading Modal */}
      <AddReadingModal
        isOpen={editModalOpen}
        initialData={selectedReading}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedReading(null);
        }}
        onReadingSaved={fetchReadings}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Glucose Reading"
        message={
          readingToDelete
            ? `Are you sure you want to delete the ${readingToDelete.time_slot} reading (${readingToDelete.glucose_value} mg/dl) on ${formatDisplayDate(readingToDelete.reading_date)}?`
            : 'Are you sure you want to delete this reading?'
        }
        confirmText="Delete Reading"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setReadingToDelete(null);
        }}
      />
    </div>
  );
};

export default ReadingHistoryPage;
