import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Megaphone, Search, Eye, X, ChevronLeft, ChevronRight, Plug, UserPlus, ListChecks, BarChart3, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MetaLeadStatusManager from '../components/MetaLeadStatusManager';
import MetaLeadAssignModal from '../components/MetaLeadAssignModal';
import { statusBadgeClass, formatFieldLabel, formatFieldValue } from '../utils/metaLeadStatus';

const PAGE_SIZES = [20, 50, 100];

const MetaLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ pages: [], forms: [] });
  const [telecallers, setTelecallers] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Filters (applied on the server)
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [pageId, setPageId] = useState('');
  const [formId, setFormId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [statusId, setStatusId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [leadTracks, setLeadTracks] = useState(null);
  const [unassignedTrack, setUnassignedTrack] = useState(null);
  const [modalAssigneeId, setModalAssigneeId] = useState('');
  const [modalAssigning, setModalAssigning] = useState(false);
  const [statusForm, setStatusForm] = useState({ statusId: '', remark: '' });
  const [savingStatus, setSavingStatus] = useState(false);
  const [isStatusManagerOpen, setIsStatusManagerOpen] = useState(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    fetchFilterOptions();
    fetchTelecallers();
    fetchStatuses();
  }, []);

  // Debounce typing in the search box
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchLeads();
  }, [search, pageId, formId, assignedTo, statusId, fromDate, toDate, page, pageSize]);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/integrations/meta/leads/filters');
      setFilterOptions(response.data);
    } catch (e) {}
  };

  const fetchTelecallers = async () => {
    try {
      const response = await api.get('/users?role=counsellor');
      setTelecallers(response.data);
    } catch (e) {}
  };

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/integrations/meta/lead-statuses');
      setStatuses(response.data);
    } catch (e) {}
  };

  const fetchLeads = async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (pageId) params.pageId = pageId;
      if (formId) params.formId = formId;
      if (assignedTo) params.assignedTo = assignedTo;
      if (statusId) params.statusId = statusId;
      // Whole days in the user's own timezone
      if (fromDate) params.from = new Date(`${fromDate}T00:00:00`).toISOString();
      if (toDate) params.to = new Date(`${toDate}T23:59:59.999`).toISOString();

      const response = await api.get('/integrations/meta/leads', { params });
      if (requestId !== latestRequest.current) return; // a newer request is on its way

      setLeads(response.data.leads);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      if (requestId === latestRequest.current) {
        toast.error('Failed to load Meta leads');
      }
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  };

  const updateFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handlePageFilter = (e) => {
    setPageId(e.target.value);
    setFormId('');
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setPageId('');
    setFormId('');
    setAssignedTo('');
    setStatusId('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const handleAssigned = () => {
    setIsAssignOpen(false);
    fetchLeads();
  };

  const fetchLeadTracks = async (leadId) => {
    try {
      const response = await api.get(`/integrations/meta/leads/${leadId}/assignments`);
      const assignments = response.data.assignments || [];
      const unassigned = response.data.unassigned || null;
      setLeadTracks(assignments);
      setUnassignedTrack(unassigned);
      const active = assignments.find((track) => track.isActive);
      setStatusForm((current) => ({
        statusId: active?.currentStatus?._id || unassigned?.currentStatus?._id || '',
        remark: current.remark,
      }));
    } catch (error) {
      setLeadTracks([]);
      setUnassignedTrack(null);
    }
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setLeadTracks(null);
    setUnassignedTrack(null);
    setModalAssigneeId('');
    setStatusForm({ statusId: lead.currentStatus?._id || '', remark: '' });
    fetchLeadTracks(lead._id);
  };

  const handleStatusSave = async () => {
    if (!statusForm.statusId) {
      toast.error('Select a status');
      return;
    }
    setSavingStatus(true);
    try {
      const response = await api.put(`/integrations/meta/leads/${selectedLead._id}/status`, statusForm);
      toast.success('Status updated');
      setSelectedLead({ ...selectedLead, currentStatus: response.data.currentStatus });
      setStatusForm({ statusId: response.data.currentStatus?._id || '', remark: '' });
      fetchLeadTracks(selectedLead._id);
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  // Assign or reassign the lead that is open in the details window
  const handleAssignFromModal = async () => {
    setModalAssigning(true);
    try {
      const unassign = modalAssigneeId === 'unassign';
      const response = await api.post('/integrations/meta/leads/assign', {
        leadIds: [selectedLead._id],
        telecallerId: unassign ? null : modalAssigneeId,
      });
      toast.success(response.data.message);

      const newOwner = unassign ? null : telecallers.find((tc) => tc._id === modalAssigneeId);
      setSelectedLead({
        ...selectedLead,
        assignedTo: newOwner ? { _id: newOwner._id, name: newOwner.name, email: newOwner.email } : null,
      });
      setModalAssigneeId('');
      fetchLeadTracks(selectedLead._id);
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign lead');
    } finally {
      setModalAssigning(false);
    }
  };

  const handleCloseStatusManager = () => {
    setIsStatusManagerOpen(false);
    fetchStatuses();
    fetchLeads();
  };

  const formOptions = pageId ? filterOptions.forms.filter((f) => f.pageId === pageId) : filterOptions.forms;
  const hasFilters = searchInput || pageId || formId || assignedTo || statusId || fromDate || toDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" /> Meta Leads
          </h2>
          <p className="text-xs text-slate-400 mt-1">Leads collected from Facebook Lead Ads. Assign them to counsellors and track their progress.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setIsAssignOpen(true)} className="btn-primary flex items-center gap-1.5">
            <UserPlus className="w-4.5 h-4.5" /> Assign Leads
          </button>
          <button onClick={() => setIsStatusManagerOpen(true)} className="btn-outline flex items-center gap-1.5">
            <ListChecks className="w-4.5 h-4.5" /> Statuses
          </button>
          <Link to="/dashboard/meta-leads/report" className="btn-outline flex items-center gap-1.5">
            <BarChart3 className="w-4.5 h-4.5" /> Performance
          </Link>
          <Link to="/dashboard/integrations/meta" className="btn-outline flex items-center gap-1.5">
            <Plug className="w-4.5 h-4.5" /> Meta Connection
          </Link>
        </div>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, phone, email or any answer..."
              className="input-field pl-10"
            />
          </div>

          <select value={pageId} onChange={handlePageFilter} className="input-field py-2 md:max-w-[200px]">
            <option value="">All Pages</option>
            {filterOptions.pages.map((p) => (
              <option key={p.pageId} value={p.pageId}>{p.pageName}</option>
            ))}
          </select>

          <select value={formId} onChange={updateFilter(setFormId)} className="input-field py-2 md:max-w-[200px]">
            <option value="">All Forms</option>
            {formOptions.map((f) => (
              <option key={f.formId} value={f.formId}>{f.formName}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <select value={assignedTo} onChange={updateFilter(setAssignedTo)} className="input-field py-2 md:max-w-[220px]">
            <option value="">All Counsellors</option>
            <option value="unassigned">Unassigned</option>
            {telecallers.map((tc) => (
              <option key={tc._id} value={tc._id}>{tc.name}</option>
            ))}
          </select>

          <select value={statusId} onChange={updateFilter(setStatusId)} className="input-field py-2 md:max-w-[200px]">
            <option value="">All Statuses</option>
            <option value="none">Not started</option>
            {statuses.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">Received</label>
            <input type="date" value={fromDate} max={toDate || undefined} onChange={updateFilter(setFromDate)} className="input-field py-2 sm:max-w-[170px]" />
            <span className="text-xs font-semibold text-slate-400">to</span>
            <input type="date" value={toDate} min={fromDate || undefined} onChange={updateFilter(setToDate)} className="input-field py-2 sm:max-w-[170px]" />
            {hasFilters && (
              <button onClick={clearFilters} className="text-[11px] font-bold text-slate-500 hover:text-blue-600 shrink-0">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                  <th className="p-4">Lead</th>
                  <th className="p-4">Lead Form</th>
                  <th className="p-4">Assigned Counsellor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Received</th>
                  <th className="p-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leads.length > 0 ? (
                  leads.map((l) => {
                    const contact = [l.phone, l.email].filter(Boolean).join(' | ');
                    return (
                      <tr key={l._id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 leading-tight">{l.fullName || 'Meta Lead'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {contact || `${Object.keys(l.fields || {}).length} answer(s)`}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-700">{l.formName || l.formId}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{l.campaignName || l.pageName || l.pageId}</p>
                        </td>
                        <td className="p-4">
                          <p className={`font-bold ${l.assignedTo ? 'text-slate-800' : 'text-slate-400'}`}>{l.assignedTo?.name || 'Unallocated'}</p>
                        </td>
                        <td className="p-4">
                          {l.currentStatus ? (
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${statusBadgeClass(l.currentStatus.color)}`}>
                              {l.currentStatus.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold text-[10px]">{l.assignedTo ? 'Not started' : '-'}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-700">
                            {new Date(l.leadCreatedAt || l.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleViewLead(l)}
                              className="px-2 py-1 bg-blue-600/10 text-blue-700 hover:bg-blue-600/20 rounded font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                      {hasFilters ? 'No Meta leads match these filters' : 'No Meta leads received yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-slate-400 font-semibold">
              {total} lead(s) | Page {page} of {totalPages}
            </p>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg px-2 py-1 bg-white"
              title="Leads per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || loading}
              className="px-2 py-1 bg-slate-900/10 text-slate-800 hover:bg-slate-900/20 rounded font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-2 py-1 bg-slate-900/10 text-slate-800 hover:bg-slate-900/20 rounded font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LEAD DETAILS MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[88vh] overflow-hidden shadow-xl animate-fade-in flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" /> {selectedLead.fullName || 'Meta Lead'}
              </h3>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: lead answers and where the lead came from */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {Object.entries(selectedLead.fields || {}).map(([key, value]) => (
                    <div key={key} className="min-w-0">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">{formatFieldLabel(key)}</p>
                      <p className="text-xs font-semibold text-slate-800 break-words">{formatFieldValue(value) || '-'}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-1 text-[10px] text-slate-400 font-semibold">
                  <p>Form: {selectedLead.formName || selectedLead.formId}</p>
                  <p>Page: {selectedLead.pageName || selectedLead.pageId}</p>
                  {(selectedLead.campaignName || selectedLead.campaignId) && (
                    <p>Campaign: {selectedLead.campaignName || selectedLead.campaignId}</p>
                  )}
                  {(selectedLead.adSetName || selectedLead.adSetId) && (
                    <p>Ad set: {selectedLead.adSetName || selectedLead.adSetId}</p>
                  )}
                  {(selectedLead.adName || selectedLead.adId) && <p>Ad: {selectedLead.adName || selectedLead.adId}</p>}
                  <p>Received: {new Date(selectedLead.leadCreatedAt || selectedLead.createdAt).toLocaleString()}</p>
                  <p>Meta lead ID: {selectedLead.externalLeadId}</p>
                </div>
              </div>

              {/* Right: assign the lead, and each telecaller's separate status track */}
              <div className="space-y-3 md:border-l md:border-slate-100 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Assign or reassign this lead */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    {selectedLead.assignedTo ? `Reassign (currently with ${selectedLead.assignedTo.name})` : 'Assign to'}
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={modalAssigneeId}
                      onChange={(e) => setModalAssigneeId(e.target.value)}
                      className="input-field py-2 bg-white flex-1 min-w-0"
                    >
                      <option value="">Select counsellor...</option>
                      {telecallers
                        .filter((tc) => tc.status === 'active' && tc._id !== selectedLead.assignedTo?._id)
                        .map((tc) => (
                          <option key={tc._id} value={tc._id}>{tc.name} ({tc.phone})</option>
                        ))}
                      {selectedLead.assignedTo && <option value="unassign">Remove assignment</option>}
                    </select>
                    <button
                      onClick={handleAssignFromModal}
                      disabled={modalAssigning || !modalAssigneeId}
                      className="btn-primary px-4 py-2 shrink-0 disabled:opacity-60"
                    >
                      <UserPlus className="w-4 h-4" /> {modalAssigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lead status</label>
                  {!selectedLead.assignedTo && (
                    <p className="text-[11px] text-slate-500 font-semibold">You can set a status before this lead is assigned to a counsellor.</p>
                  )}
                  <select
                    value={statusForm.statusId}
                    onChange={(e) => setStatusForm({ ...statusForm, statusId: e.target.value })}
                    className="input-field py-2 bg-white"
                  >
                    <option value="">Select status</option>
                    {statuses.map((status) => (
                      <option key={status._id} value={status._id}>{status.name}</option>
                    ))}
                  </select>
                  <textarea
                    value={statusForm.remark}
                    onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })}
                    placeholder="Remark"
                    rows="2"
                    maxLength={1000}
                    className="input-field py-2 bg-white resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleStatusSave}
                    disabled={savingStatus || !statusForm.statusId}
                    className="btn-primary px-4 py-2 disabled:opacity-60"
                  >
                    {savingStatus ? 'Saving...' : 'Update status'}
                  </button>
                </div>

                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Counsellor activity</p>
                {unassignedTrack?.history?.length > 0 && !leadTracks?.some((track) => track.isActive) && (
                  <div className="p-3 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-900">Before assignment</p>
                    <div className="space-y-1.5">
                      {unassignedTrack.history.map((entry, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${statusBadgeClass(entry.statusColor)}`}>
                            {entry.statusName}
                          </span>
                          <div className="min-w-0">
                            {entry.remark && <p className="text-[11px] text-slate-700 font-medium break-words">"{entry.remark}"</p>}
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(entry.changedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {leadTracks === null ? (
                  <p className="text-[11px] text-slate-400 font-semibold">Loading...</p>
                ) : leadTracks.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-semibold">This lead has not been assigned yet.</p>
                ) : (
                  leadTracks.map((track) => (
                    <div key={track._id} className="p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900">{track.telecaller?.name || 'Removed user'}</p>
                        {track.isActive ? (
                          <span className="text-[9px] font-bold uppercase text-emerald-700">Current owner</span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Reassigned
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Assigned {new Date(track.assignedAt).toLocaleString()}
                        {track.endedAt ? ` | until ${new Date(track.endedAt).toLocaleString()}` : ''}
                      </p>
                      {track.history.length > 0 ? (
                        <div className="space-y-1.5">
                          {track.history.map((entry, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${statusBadgeClass(entry.statusColor)}`}>
                                {entry.statusName}
                              </span>
                              <div className="min-w-0">
                                {entry.remark && <p className="text-[11px] text-slate-700 font-medium break-words">"{entry.remark}"</p>}
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(entry.changedAt).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-semibold">Not started</p>
                      )}
                    </div>
                  ))
                )}
              </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedLead(null)}
                className="btn-outline px-4 py-2 border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isStatusManagerOpen && <MetaLeadStatusManager onClose={handleCloseStatusManager} />}

      {isAssignOpen && (
        <MetaLeadAssignModal telecallers={telecallers} onClose={() => setIsAssignOpen(false)} onAssigned={handleAssigned} />
      )}
    </div>
  );
};

export default MetaLeadsPage;
