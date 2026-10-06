import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ClipboardList, Printer, ArrowLeft, Plane, HelpCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentAdmitCardPage = () => {
  const [admitCard, setAdmitCard] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [admitCardRes, settingsRes] = await Promise.all([
        api.get('/exams/admit-card/me').catch(() => null),
        api.get('/settings').catch(() => null)
      ]);
      if (admitCardRes) setAdmitCard(admitCardRes.data);
      if (settingsRes) setSettings(settingsRes.data);
    } catch (error) {
      console.log('Error loading admit card details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('admit-card-print-area').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (settings && !settings.admitCardEnabled) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto shadow-sm">
        <HelpCircle className="w-12 h-12 text-blue-600 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-700">Downloads Temporarily Disabled</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
          Entrance examination admit card downloading is currently deactivated by the Innovbit Administration. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" /> Entrance Examination Ticket
          </h2>
          <p className="text-xs text-slate-400 mt-1">View, download, or print your admit card for the upcoming entrance examination.</p>
        </div>
        {admitCard && (
          <button onClick={handlePrint} className="btn-primary flex items-center gap-1.5 shadow-sm">
            <Printer className="w-4 h-4" /> Print Ticket
          </button>
        )}
      </div>

      {admitCard ? (
        /* Admit Card Layout */
        <div className="max-w-2xl mx-auto bg-slate-100 p-6 rounded-2xl border border-slate-200">
          {/* PRINTABLE AREA */}
          <div id="admit-card-print-area" className="bg-white p-8 border-2 border-slate-350 rounded-2xl space-y-6 shadow-sm font-sans text-slate-800">
            {/* Header logo branding */}
            <div className="flex items-center justify-between border-b-2 border-slate-950 pb-5">
              <div className="space-y-1">
                <h1 className="text-md font-bold text-slate-950 uppercase tracking-tight">Innovbit New Delhi</h1>
                <p className="text-[9px] text-slate-400 font-semibold leading-none">Approved by DGCA, Ministry of Civil Aviation, Govt. of India</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Plane className="w-6 h-6 text-blue-600 rotate-45" />
              </div>
            </div>

            <div className="text-center py-1">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-950 border-b border-slate-100 pb-2">
                ENTRANCE EXAMINATION HALL TICKET
              </h2>
            </div>

            {/* Candidate info grid */}
            <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-5">
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider">Candidate Name</p>
                  <p className="font-bold text-slate-950 text-sm">{admitCard.student?.name}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider">Security Roll Number</p>
                  <p className="font-mono font-bold text-blue-600 text-sm">{admitCard.rollNumber}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider">Contact Phone</p>
                  <p className="font-bold text-slate-950">{admitCard.student?.phone}</p>
                </div>
              </div>

              <div className="space-y-3 text-right md:text-left md:pl-10">
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider">Scheduled Exam Date</p>
                  <p className="font-bold text-slate-950 text-sm">
                    {new Date(admitCard.examDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider">Reporting Time</p>
                  <p className="font-bold text-slate-950">{admitCard.examTime}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider">Exam Center Location</p>
                  <p className="font-bold text-slate-950 leading-snug">{admitCard.examCenter}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2.5">
              <h4 className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Candidate Instructions
              </h4>
              <p className="text-[10px] text-slate-500 whitespace-pre-line leading-relaxed font-semibold">
                {admitCard.instructions}
              </p>
            </div>

            {/* Verification sign-off */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-[9px] font-bold text-slate-350 uppercase">
              <p>Generated: {new Date(admitCard.createdAt).toLocaleDateString()}</p>
              <p className="border-t border-slate-200 pt-1 px-4 mt-6">Controller of Examinations</p>
            </div>
          </div>
        </div>
      ) : (
        /* Empty screen */
        <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <XCircle className="w-12 h-12 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No admit card scheduled</h3>
          <p className="text-xs text-slate-400">
            Your admit card for the entrance examination has not been generated yet. Please contact the admissions manager or ensure your query is registered.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentAdmitCardPage;
