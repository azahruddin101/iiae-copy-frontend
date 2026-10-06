import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  PhoneCall,
  Users,
  BookOpen,
  IndianRupee,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { toast } from 'react-hot-toast';

const DashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If student, redirect directly to student status page
    if (user?.role === 'student') {
      navigate('/dashboard/student/status');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // COLOR PALETTE FOR GRAPHS
  const COLORS = ['#eab308', '#3b82f6', '#10b981', '#f97316', '#ef4444', '#6366f1'];

  // 1. ADMIN & MANAGER VIEW
  const renderAdminStats = () => {
    const leadsData = [
      { name: 'Interested', value: stats?.leads?.interested || 0 },
      { name: 'Callbacks', value: stats?.leads?.callback || 0 },
      { name: 'Not Picked', value: stats?.leads?.not_picked || 0 },
      { name: 'Not Eligible', value: stats?.leads?.not_eligible || 0 },
      { name: 'Registered', value: stats?.leads?.registered || 0 },
      { name: 'Not Interested', value: stats?.leads?.not_interested || 0 },
    ].filter(d => d.value > 0);

    const financeData = [
      { name: 'Collected', amount: stats?.finance?.totalCollected || 0 },
      { name: 'Pending Balance', amount: stats?.finance?.totalPendingFees || 0 },
    ];

    return (
      <div className="space-y-6">
        {/* Upper cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Leads / Queries</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.leads?.total || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <PhoneCall className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Enrolled Students</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.students?.total || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Courses / Batches</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.academics?.courses || 0} / {stats?.academics?.batches || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Collections Summary</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{stats?.finance?.totalCollected?.toLocaleString() || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Graphs panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Leads Funnel Analysis</h4>
            <div className="h-64">
              {leadsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {leadsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Leads`, 'Count']} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">No lead data recorded yet</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Tuition Fees Analysis</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#ca8a04" radius={[8, 8, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f43f5e" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. TELECALLER VIEW
  const renderTelecallerStats = () => {
    const assignedLeads = stats?.leads?.total || 0;
    const callbacks = stats?.leads?.callback || 0;
    const interested = stats?.leads?.interested || 0;
    const registered = stats?.leads?.registered || 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Assigned Leads</p>
              <h3 className="text-2xl font-bold text-slate-900">{assignedLeads}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <PhoneCall className="w-5.5 h-5.5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Follow-up Callbacks</p>
              <h3 className="text-2xl font-bold text-slate-900">{callbacks}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Calendar className="w-5.5 h-5.5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Interested Enquiries</p>
              <h3 className="text-2xl font-bold text-slate-900">{interested}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-5.5 h-5.5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Successful Registrations</p>
              <h3 className="text-2xl font-bold text-slate-900">{registered}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600">
              <TrendingUp className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* Quick actions info */}
        <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Leads management dashboard active</h4>
            <p className="text-xs text-slate-500">You can add new candidates, log follow-up results, and track pending callbacks.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/leads')}
            className="btn-primary"
          >
            Open Leads Folder <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // 3. ACCOUNTANT VIEW
  const renderAccountantStats = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Fees Collected</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{stats?.finance?.totalCollected?.toLocaleString() || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Pending Balance outstanding</p>
              <h3 className="text-2xl font-bold text-slate-900 font-sans">₹{stats?.finance?.totalPendingFees?.toLocaleString() || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Receipts Log Count</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.finance?.totalPaymentsCount || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent payments table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Recent Transactions</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Student Name</th>
                  <th className="pb-3 font-semibold">Receipt Number</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Payment Mode</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {stats?.recentPayments?.length > 0 ? (
                  stats.recentPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-slate-900">{p.student?.name}</td>
                      <td className="py-3 text-slate-500 font-mono font-semibold">{p.receiptNumber}</td>
                      <td className="py-3 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                          {p.mode}
                        </span>
                      </td>
                      <td className="py-3 font-extrabold text-slate-900 text-right">₹{p.amount.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">No payments recorded recently</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 4. TEACHER VIEW
  const renderTeacherStats = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Assigned Batches</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.academics?.batchesCount || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Class Strength</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.academics?.studentsCount || 0} Students</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Batches schedule summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">My Batches List</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.batches?.length > 0 ? (
              stats.batches.map((b) => (
                <div key={b._id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col justify-between hover:border-amber-500/30 transition-all">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-900">{b.name}</h5>
                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {b.schedule || 'Schedule not configured'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3">
                    <span className="text-[10px] font-bold text-slate-400">{b.studentsCount} Enrolled Students</span>
                    <button
                      onClick={() => navigate('/dashboard/teacher/batches')}
                      className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      View Students <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-slate-400 font-semibold">No active batches assigned to you</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Operational Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1">Hello, {user?.name || 'User'}. Welcome to your department command module.</p>
      </div>

      {/* Render stats cards based on role */}
      {user?.role === 'admin' || user?.role === 'manager' ? renderAdminStats() : null}
      {user?.role === 'counsellor' ? renderTelecallerStats() : null}
      {user?.role === 'accountant' ? renderAccountantStats() : null}
      {user?.role === 'teacher' ? renderTeacherStats() : null}
    </div>
  );
};

export default DashboardStats;
