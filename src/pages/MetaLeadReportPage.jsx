import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { BarChart3, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { statusBadgeClass } from '../utils/metaLeadStatus';

// Per-telecaller performance on Meta leads
const MetaLeadReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchReport();
  }, [fromDate, toDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      // Whole days in the user's own timezone
      if (fromDate) params.from = new Date(`${fromDate}T00:00:00`).toISOString();
      if (toDate) params.to = new Date(`${toDate}T23:59:59.999`).toISOString();

      const response = await api.get('/integrations/meta/reports/telecallers', { params });
      setReport(response.data);
    } catch (error) {
      toast.error('Failed to load the performance report');
    } finally {
      setLoading(false);
    }
  };

  const telecallers = report?.telecallers || [];
  const sum = (key) => telecallers.reduce((total, t) => total + t[key], 0);
  const assignedTotal = sum('totalAssigned');
  const convertedTotal = sum('converted');

  const tiles = report
    ? [
        { label: 'Meta leads', value: report.totalLeads },
        { label: 'Unassigned', value: report.unassignedLeads },
        { label: 'Active with counsellors', value: sum('activeLeads') },
        { label: 'Worked', value: sum('workedLeads') },
        { label: 'Converted', value: convertedTotal },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Counsellor Performance
          </h2>
          <p className="text-xs text-slate-400 mt-1">How each counsellor is progressing on the Meta leads assigned to them.</p>
        </div>
        <Link to="/dashboard/meta-leads" className="btn-outline flex items-center gap-1.5">
          <ChevronLeft className="w-4.5 h-4.5" /> Meta Leads
        </Link>
      </div>

      {/* Date range */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">Leads assigned</label>
        <input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} className="input-field py-2 sm:max-w-[180px]" />
        <span className="text-xs font-semibold text-slate-400">to</span>
        <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} className="input-field py-2 sm:max-w-[180px]" />
        {(fromDate || toDate) && (
          <button onClick={() => { setFromDate(''); setToDate(''); }} className="text-[11px] font-bold text-slate-500 hover:text-blue-600">
            All time
          </button>
        )}
      </div>

      {loading && !report ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Totals */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {tiles.map((tile) => (
              <div key={tile.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{tile.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{tile.value}</p>
              </div>
            ))}
          </div>

          {/* Per telecaller */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="p-4">Counsellor</th>
                    <th className="p-4 text-right">Assigned</th>
                    <th className="p-4 text-right">Active</th>
                    <th className="p-4 text-right">Not Started</th>
                    <th className="p-4 text-right">Worked</th>
                    <th className="p-4 text-right">Reassigned Away</th>
                    <th className="p-4 text-right">Converted</th>
                    <th className="p-4 text-right">Status Updates</th>
                    <th className="p-4">Current Statuses</th>
                    <th className="p-4">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {telecallers.length > 0 ? (
                    telecallers.map((t) => (
                      <tr key={t.user._id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 leading-tight">{t.user.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {t.user.email}
                            {t.user.status !== 'active' ? ` | ${t.user.status}` : ''}
                          </p>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">{t.totalAssigned}</td>
                        <td className="p-4 text-right font-semibold">{t.activeLeads}</td>
                        <td className="p-4 text-right font-semibold">{t.notStarted}</td>
                        <td className="p-4 text-right font-semibold">{t.workedLeads}</td>
                        <td className="p-4 text-right font-semibold">{t.reassignedAway}</td>
                        <td className="p-4 text-right">
                          <p className="font-bold text-emerald-700">{t.converted}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{t.conversionRate}%</p>
                        </td>
                        <td className="p-4 text-right font-semibold">{t.statusUpdates}</td>
                        <td className="p-4">
                          {t.statuses.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {t.statuses.map((s) => (
                                <span key={s.statusId} className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${statusBadgeClass(s.color)}`}>
                                  {s.name}: {s.count}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-semibold text-[10px]">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-700">
                            {t.lastActivityAt ? new Date(t.lastActivityAt).toLocaleString() : 'No activity'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400 font-semibold">No counsellors found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="p-4 border-t border-slate-100 text-[10px] text-slate-400 font-semibold leading-relaxed">
              Assigned counts every lead a counsellor has been given, including leads later reassigned to someone else.
              Converted counts leads whose current status is marked as a conversion ({convertedTotal} of {assignedTotal} overall).
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default MetaLeadReportPage;
