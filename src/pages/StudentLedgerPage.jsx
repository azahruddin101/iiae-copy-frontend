import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { IndianRupee, Printer, Eye, X, BookOpen, User, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentLedgerPage = () => {
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments/ledger/me');
      setLedgerData(response.data);
    } catch (error) {
      toast.error('Failed to load tuition fee ledger');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById('student-receipt-print-area').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fd = ledgerData?.feeDetails;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-amber-500" /> Fee Ledger & Accounts
        </h2>
        <p className="text-xs text-slate-400 mt-1">Review your tuition fee ledger, scholarships applied, and download transaction receipts.</p>
      </div>

      {/* Roster ledger stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-sm">
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Total Tuition Base</p>
          <p className="text-md font-extrabold text-slate-950">₹{fd?.totalFee?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-sm">
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Applied Scholarship</p>
          <p className="text-md font-extrabold text-amber-600">₹{fd?.scholarshipAmount?.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 space-y-1">
          <p className="text-[9px] uppercase tracking-wider text-emerald-600 font-extrabold">Net Tuition Fees</p>
          <p className="text-md font-extrabold text-emerald-700">₹{fd?.netFee?.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 space-y-1">
          <p className="text-[9px] uppercase tracking-wider text-rose-600 font-extrabold">Outstanding Balance</p>
          <p className="text-md font-extrabold text-rose-700">₹{fd?.pendingBalance?.toLocaleString()}</p>
        </div>
      </div>

      {fd?.discountRemarks && (
        <div className="bg-amber-500/[0.02] border border-amber-500/10 p-4 rounded-xl max-w-4xl">
          <p className="text-[10px] uppercase text-amber-600 font-extrabold tracking-wider">Applied Scholarship Note</p>
          <p className="text-xs text-slate-600 mt-1 font-medium">"{fd.discountRemarks}"</p>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-4xl">
        <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
          Payment Receipt Logs
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="p-4">Receipt Number</th>
                <th className="p-4">Payment Date</th>
                <th className="p-4">Method Mode</th>
                <th className="p-4">Officer Signature</th>
                <th className="p-4 text-right">Amount Deposited</th>
                <th className="p-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {ledgerData?.payments?.length > 0 ? (
                ledgerData.payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-600">{p.receiptNumber}</td>
                    <td className="p-4 text-slate-500 font-medium">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 capitalize text-slate-500">{p.mode}</td>
                    <td className="p-4 text-slate-500 font-semibold">{p.receivedBy?.name}</td>
                    <td className="p-4 font-extrabold text-slate-950 text-right">₹{p.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedPayment(p);
                          setIsReceiptOpen(true);
                        }}
                        className="p-1 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 rounded cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">No transactions recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE RECEIPT MODAL */}
      {isReceiptOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-100">
              <h3 className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Tuition Receipt</h3>
              <button onClick={() => { setSelectedPayment(null); setIsReceiptOpen(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
              {/* PRINT AREA */}
              <div id="student-receipt-print-area" className="bg-white p-8 border border-slate-200 rounded-2xl space-y-6 shadow-inner font-sans text-slate-800">
                {/* Logo header */}
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-5">
                  <div className="space-y-1">
                    <h1 className="text-md font-bold text-slate-950 uppercase tracking-tight">Innovbit New Delhi</h1>
                    <p className="text-[9px] text-slate-400 font-semibold leading-none">Approved by DGCA, Ministry of Civil Aviation, Govt. of India</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full inline-block mb-1">Receipt</span>
                    <p className="text-xs font-mono font-extrabold text-slate-950">{selectedPayment.receiptNumber}</p>
                  </div>
                </div>

                {/* Candidate details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider mb-1">Issued to</p>
                    <p className="font-bold text-slate-950">{ledgerData.student?.name || user?.name}</p>
                    <p className="text-slate-400 font-semibold mt-0.5">Roll: {ledgerData.student?.studentId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-wider mb-1">Receipt Date</p>
                    <p className="font-bold text-slate-950">{new Date(selectedPayment.date).toLocaleDateString()}</p>
                    <p className="text-slate-400 font-semibold mt-0.5">Mode: {selectedPayment.mode.toUpperCase()}</p>
                  </div>
                </div>

                {/* Ledger Items details */}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider">
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-50">
                        <td className="p-3 font-semibold text-slate-700">
                          Tuition Course Fees Deposit
                          {selectedPayment.remarks && <span className="block text-[10px] text-slate-400 font-semibold mt-1">Note: {selectedPayment.remarks}</span>}
                        </td>
                        <td className="p-3 font-extrabold text-slate-950 text-right">₹{selectedPayment.amount?.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-3 font-extrabold text-slate-950">Total Paid (INR)</td>
                        <td className="p-3 font-extrabold text-slate-950 text-right text-sm">₹{selectedPayment.amount?.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Sign off references */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-[10px] font-semibold text-slate-400 uppercase">
                  <div>
                    <p>Cashier Reference: {selectedPayment.receivedBy?.name || 'Accountant Office'}</p>
                  </div>
                  <div className="text-right text-[9px] font-bold text-slate-350">
                    <p className="border-t border-slate-200 pt-1 px-4 mt-6">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => { setSelectedPayment(null); setIsReceiptOpen(false); }}
                className="btn-outline px-4 py-2 border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                Close
              </button>
              <button onClick={handlePrintReceipt} className="btn-primary px-4 py-2 flex items-center gap-1.5">
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLedgerPage;
