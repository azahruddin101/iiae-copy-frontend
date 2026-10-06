import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, Award, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentResultsPage = () => {
  const [exams, setExams] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, settingsRes] = await Promise.all([
        api.get('/exams').catch(() => null),
        api.get('/settings').catch(() => null)
      ]);
      if (examsRes) setExams(examsRes.data);
      if (settingsRes) setSettings(settingsRes.data);
    } catch (error) {
      toast.error('Failed to load academic records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (settings && !settings.resultEnabled) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto shadow-sm">
        <HelpCircle className="w-12 h-12 text-blue-600 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-700">Results Publication Pending</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
          Entrance examination results are currently pending publication by the Innovbit Administration. Please check back later.
        </p>
      </div>
    );
  }

  // Filter exams that have results for this student
  const examCards = exams.filter(e => e.myResult !== undefined && e.myResult !== null);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" /> Academic Results
        </h2>
        <p className="text-xs text-slate-400 mt-1">Review your official grades, entrance exam scores, and report card logs.</p>
      </div>

      {/* Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
        {examCards.length > 0 ? (
          examCards.map((exam) => {
            const res = exam.myResult;
            const percentage = ((res.marksObtained / exam.maxMarks) * 100).toFixed(1);
            const isPassed = res.status === 'passed';

            return (
              <div key={exam._id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-600/10 transition-all shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {exam.type} Test
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {new Date(exam.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{exam.name}</h3>
                    <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Maximum Marks available: {exam.maxMarks}</p>
                  </div>

                  {/* Circular Score summary */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-center bg-white p-3 rounded-lg border border-slate-100 shrink-0 shadow-inner">
                      <p className="text-xs font-mono font-extrabold text-slate-950 text-md leading-none">
                        {res.marksObtained}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Obtained</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {isPassed ? (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 fill-emerald-50" /> Passed ({percentage}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 fill-rose-50" /> Failed ({percentage}%)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 italic font-semibold">
                        {res.remarks ? `"${res.remarks}"` : '"Grading completed by Controller."'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400 font-semibold bg-white border border-slate-200 rounded-2xl max-w-md">
            No graded exam card logs found on your profile yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResultsPage;
