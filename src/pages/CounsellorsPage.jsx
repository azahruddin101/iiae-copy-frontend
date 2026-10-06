import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Phone, Mail, CheckCircle, BarChart3, Award, Star, Edit3, X, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CounsellorsPage = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active',
  });

  useEffect(() => {
    fetchCounsellorData();
  }, []);

  const fetchCounsellorData = async () => {
    setLoading(true);
    try {
      const usersResponse = await api.get('/users');
      const filteredCounsellors = usersResponse.data.filter((u) => u.role === 'counsellor');

      // 2. Fetch leads to map allocations
      const leadsResponse = await api.get('/leads');
      setLeads(leadsResponse.data);
      setCounsellors(filteredCounsellors);
    } catch (error) {
      toast.error('Failed to load counsellors data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (counsellor) => {
    setSelectedUser(counsellor);
    setFormData({
      name: counsellor.name,
      email: counsellor.email,
      phone: counsellor.phone,
      password: '',
      status: counsellor.status || 'active',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      await api.put(`/users/${selectedUser._id}`, payload);
      toast.success('Counsellor account updated successfully');
      setIsEditOpen(false);
      fetchCounsellorData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update counsellor account');
    }
  };

  // Helper to calculate statistics for a counsellor
  const getCounsellorStats = (userId) => {
    const assignedLeads = leads.filter(l => l.assignedTo?._id === userId);
    const convertedLeads = assignedLeads.filter(l => l.status === 'registered');
    const callbacks = assignedLeads.filter(l => l.status === 'callback');
    const rate = assignedLeads.length > 0 
      ? ((convertedLeads.length / assignedLeads.length) * 100).toFixed(1) 
      : 0;

    return {
      assigned: assignedLeads.length,
      converted: convertedLeads.length,
      callbacks: callbacks.length,
      rate: rate
    };
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" /> Admissions Counsellors
        </h2>
        <p className="text-xs text-slate-400 mt-1">Review counsellors performance metrics, query conversion ratios, and lead distribution.</p>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {counsellors.map(c => {
            const stats = getCounsellorStats(c._id);
            return (
              <div key={c._id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-600/20 transition-all shadow-sm">
                <div className="space-y-4">
                  {/* Avatar, Details & Edit Action */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                        {c.name.split(' ').map(n=>n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{c.name}</h3>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                          {c.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditClick(c)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Edit Account / Reset Password"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contact details */}
                  <div className="text-xs space-y-1.5 border-t border-slate-100 pt-3 text-slate-500 font-medium">
                    <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}</p>
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone}</p>
                  </div>
                </div>

                {/* Performance stats grid */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 mt-4">
                  <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="font-mono font-bold text-slate-900 text-sm leading-none">{stats.assigned}</p>
                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold mt-1">Leads</p>
                  </div>
                  <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="font-mono font-bold text-emerald-600 text-sm leading-none">{stats.converted}</p>
                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold mt-1">Admitted</p>
                  </div>
                  <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="font-mono font-bold text-blue-600 text-sm leading-none">{stats.rate}%</p>
                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold mt-1">Conv.</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-fade-in flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" /> Edit Counsellor Account
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-500" /> New Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Set new password if changing"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Account Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="btn-outline px-4 py-2 border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-4 py-2 cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellorsPage;
