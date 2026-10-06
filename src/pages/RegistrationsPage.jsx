import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, CheckCircle, XCircle, User, Phone, Mail, Award, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

const fileHref = (value) => {
  if (!String(value || '').startsWith('/uploads/')) return '';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  return `${apiBase.replace(/\/api\/?$/, '')}${value}`;
};

const RegistrationsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.pathname.endsWith('/paid') ? 'paid' : 'unpaid');

  useEffect(() => {
    setActiveTab(location.pathname.endsWith('/paid') ? 'paid' : 'unpaid');
  }, [location.pathname]);

  useEffect(() => {
    fetchRegistrations();
  }, [activeTab]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // Fetch users with role student filtered by registration status
      const response = await api.get(`/users?role=student&registrationFeePaid=${activeTab === 'paid'}`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaymentStatus = async (studentId, currentStatus) => {
    try {
      await api.put(`/users/${studentId}`, {
        registrationFeePaid: !currentStatus
      });
      toast.success(`Registration marked as ${!currentStatus ? 'PAID' : 'UNPAID'}`);
      fetchRegistrations();
    } catch (error) {
      toast.error('Failed to update registration status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" /> Candidate Registrations
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {user?.role === 'counsellor'
            ? 'Students whose registration form you submitted. Unpaid until the fee is marked paid.'
            : 'Filled registration forms. Unpaid until the fee is marked paid. Admin and manager see every student.'}
        </p>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('unpaid')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-6 transition-all cursor-pointer ${
            activeTab === 'unpaid'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Unpaid Registrations
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-6 transition-all cursor-pointer ${
            activeTab === 'paid'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Paid Registrations
        </button>
      </div>

      {/* Roster list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Candidate Profile</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Applied Course</th>
                  <th className="p-4">Exam Roll No</th>
                  <th className="p-4 text-center">Payment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.length > 0 ? (
                  students.map((student) => {
                    const profile = student.profile || {};
                    return (
                      <tr key={student._id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                              {student.name.split(' ').map(n=>n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase">
                                Registered: {new Date(student.createdAt).toLocaleDateString()}
                              </p>
                              {profile.registeredBy?.name && (
                                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">By {profile.registeredBy.name}</p>
                              )}
                              {(profile.extraAnswers || []).map((answer) => {
                                const href = fileHref(answer.value);
                                return (
                                  <p key={answer.fieldId} className="text-[10px] text-slate-500 mt-0.5">
                                    <span className="font-semibold">{answer.label}:</span>{' '}
                                    {href ? (
                                      <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-blue-600">Open file</a>
                                    ) : answer.value}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 space-y-1">
                          <p className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {student.email}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {student.phone}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-900 leading-tight">{profile.course?.name || 'Unassigned'}</p>
                          <p className="text-[10px] font-mono font-bold text-blue-600 mt-0.5">{profile.course?.code}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-600">
                          {profile.studentId || 'Not Generated'}
                        </td>
                        <td className="p-4 text-center">
                          {profile.registrationFeePaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                              <CheckCircle className="w-3.5 h-3.5" /> PAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                              <XCircle className="w-3.5 h-3.5" /> UNPAID
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleTogglePaymentStatus(student._id, profile.registrationFeePaid)}
                            className={`btn-outline px-3 py-1.5 text-[11px] rounded-lg cursor-pointer ${
                              profile.registrationFeePaid 
                                ? 'text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white' 
                                : 'text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            Mark {profile.registrationFeePaid ? 'Unpaid' : 'Paid'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                      No registrations found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationsPage;
