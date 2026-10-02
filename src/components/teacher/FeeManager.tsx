import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeeRecord } from '../../types';
import { 
  DollarSign, 
  Calendar, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  ShieldCheck, 
  QrCode,
  BellRing,
  Plus,
  Cpu,
  Eye,
  X,
  FileCheck2,
  AlertCircle,
  Image as ImageIcon,
  Check,
  ZoomIn,
  Download
} from 'lucide-react';

export const FeeManager: React.FC = () => {
  const {
    currentUser,
    batches,
    feeRecords,
    setFeeDueDate,
    sendFeeReminder,
    sendAutomatedBatchFeeReminders,
    createMonthlyFeesForBatch,
    verifyFeePayment,
  } = useApp();

  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reminderAlert, setReminderAlert] = useState<string | null>(null);

  // Dedicated Screenshot & AI Verification Modal
  const [viewingScreenshotRecord, setViewingScreenshotRecord] = useState<FeeRecord | null>(null);

  // New month invoice generation state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genBatchId, setGenBatchId] = useState(batches[0]?.id || '');
  const [genMonth, setGenMonth] = useState('November 2026');
  const [genDueDate, setGenDueDate] = useState('2026-11-05');

  // Filter fees belonging to batches taught by CURRENT TEACHER
  const myBatches = batches.filter((b) => b.teacherId === currentUser?.id);
  const myBatchIds = myBatches.map((b) => b.id);

  const teacherFees = feeRecords.filter((f) => myBatchIds.includes(f.batchId));

  const filteredFees = teacherFees.filter((fee) => {
    if (selectedBatchId !== 'all' && fee.batchId !== selectedBatchId) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'proxy_flagged') {
        return fee.isFlaggedAsProxy || fee.aiAnalysis?.isProxy;
      }
      if (statusFilter === 'has_screenshot') {
        return Boolean(fee.screenshotUrl);
      }
      if (fee.status !== statusFilter) return false;
    }
    return true;
  });

  // Analytics
  const totalCollected = teacherFees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = teacherFees
    .filter((f) => f.status === 'pending' || f.status === 'overdue' || f.status === 'verification_pending')
    .reduce((sum, f) => sum + f.amount, 0);

  const overdueCount = teacherFees.filter((f) => f.status === 'overdue').length;
  const pendingVerificationCount = teacherFees.filter((f) => f.status === 'verification_pending').length;
  const proxyFlaggedCount = teacherFees.filter((f) => f.isFlaggedAsProxy || f.aiAnalysis?.isProxy).length;
  const pendingScreenshots = teacherFees.filter((f) => f.status === 'verification_pending' && f.screenshotUrl);

  const handleSendBatchReminders = (batchId: string) => {
    const count = sendAutomatedBatchFeeReminders(batchId);
    setReminderAlert(`Automated payment reminders sent to ${count} students with pending dues!`);
    setTimeout(() => setReminderAlert(null), 3500);
  };

  const handleGenerateMonth = (e: React.FormEvent) => {
    e.preventDefault();
    createMonthlyFeesForBatch(genBatchId, genMonth, genDueDate);
    setShowGenerateModal(false);
    setReminderAlert(`Tuition fee invoices for ${genMonth} generated with due date ${genDueDate}!`);
    setTimeout(() => setReminderAlert(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Fee Management & Screenshot Verification
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              AI Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review student uploaded payment screenshots, approve verified receipts, schedule due dates, and monitor proxy fraud alerts.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Issue Next Month Invoices
          </button>
        </div>
      </div>

      {reminderAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{reminderAlert}</span>
        </div>
      )}

      {/* PENDING SCREENSHOTS QUEUE (User requirement: screenshot goes to teacher) */}
      {pendingScreenshots.length > 0 && (
        <div className="bg-blue-50/70 border-2 border-blue-200 rounded-3xl p-5 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Student Payment Screenshots Awaiting Your Verification</span>
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {pendingScreenshots.length} New
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  These students have uploaded payment screenshots from UPI. Inspect the screenshot to confirm tuition fee receipt.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingScreenshots.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-2xs hover:shadow-md transition-all flex items-center gap-3.5"
              >
                <div
                  onClick={() => setViewingScreenshotRecord(item)}
                  className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer relative group"
                >
                  <img
                    src={item.screenshotUrl}
                    alt="Receipt thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{item.studentName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{item.batchName} · {item.month}</p>
                  <p className="text-xs font-black text-blue-700 mt-0.5">₹{item.amount.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      onClick={() => setViewingScreenshotRecord(item)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-lg shadow-2xs transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Inspect & Verify
                    </button>
                    <button
                      onClick={() => verifyFeePayment(item.id, true)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg shadow-2xs transition-all active:scale-95"
                      title="Quick Approve"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fee Collected</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalCollected.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified receipts</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending Tuition</p>
          <p className="text-2xl font-black text-amber-600 mt-1">₹{totalPending.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Due within cycle</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{pendingVerificationCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Awaiting teacher</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Overdue Dues</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{overdueCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Past deadline</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white p-5 rounded-2xl border border-rose-200 shadow-xs bg-gradient-to-br from-rose-50/40 to-white">
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Proxy AI Flags
          </p>
          <p className="text-2xl font-black text-rose-700 mt-1">{proxyFlaggedCount}</p>
          <p className="text-[10px] text-rose-500 mt-0.5">Duplicate screenshot alerts</p>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">All My Batches ({myBatches.length})</option>
            {myBatches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">All Payment Statuses</option>
            <option value="verification_pending">Pending Teacher Verification ({pendingVerificationCount})</option>
            <option value="has_screenshot">Has Uploaded Screenshot</option>
            <option value="paid">Verified Paid</option>
            <option value="pending">Pending Payment</option>
            <option value="overdue">Overdue</option>
            <option value="proxy_flagged">🚨 AI Proxy Flagged ({proxyFlaggedCount})</option>
          </select>
        </div>

        {selectedBatchId !== 'all' && (
          <button
            onClick={() => handleSendBatchReminders(selectedBatchId)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <BellRing className="w-3.5 h-3.5" />
            Send Reminders to Overdue Students
          </button>
        )}
      </div>

      {/* Main Fee Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Student Tuition Fee Roster ({filteredFees.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Click any screenshot thumbnail to inspect student's uploaded payment proof
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student & Batch</th>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Uploaded Screenshot</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Bank Ref / UTR</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No fee records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const isProxy = fee.isFlaggedAsProxy || fee.aiAnalysis?.isProxy;
                  const isOverdue = fee.status === 'overdue';

                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-900">{fee.studentName}</p>
                        <p className="text-[10px] text-indigo-600 font-semibold">{fee.batchName}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{fee.month}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">₹{fee.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                          {fee.dueDate}
                        </span>
                      </td>

                      {/* UPLOADED SCREENSHOT THUMBNAIL (Student requirement) */}
                      <td className="py-3.5 px-4">
                        {fee.screenshotUrl ? (
                          <div className="flex items-center gap-2">
                            <div
                              onClick={() => setViewingScreenshotRecord(fee)}
                              className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-300 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all shrink-0"
                              title="Click to view student uploaded screenshot"
                            >
                              <img
                                src={fee.screenshotUrl}
                                alt="Proof"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => setViewingScreenshotRecord(fee)}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Proof
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No upload</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${
                          fee.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fee.status === 'verification_pending'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {fee.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Ref */}
                      <td className="py-3.5 px-4">
                        {fee.transactionRef ? (
                          <div>
                            <p className="font-mono text-slate-900 font-bold text-[11px]">{fee.transactionRef}</p>
                            <p className="text-[10px] text-slate-400">{fee.paymentMethod || 'UPI QR'}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {fee.status === 'verification_pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingScreenshotRecord(fee)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-all active:scale-95"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => verifyFeePayment(fee.id, true)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-all active:scale-95"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => verifyFeePayment(fee.id, false, isProxy ? 'Duplicate receipt proxy detected' : undefined, isProxy)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-all active:scale-95"
                            >
                              Reject
                            </button>
                          </div>
                        ) : fee.status !== 'paid' ? (
                          <button
                            onClick={() => {
                              const res = sendFeeReminder(fee.id);
                              alert(res.message);
                            }}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg shadow-2xs inline-flex items-center gap-1 transition-all active:scale-95"
                          >
                            <Send className="w-3 h-3" />
                            Remind
                          </button>
                        ) : (
                          <button
                            onClick={() => setViewingScreenshotRecord(fee)}
                            className="text-[11px] font-bold text-emerald-700 hover:underline"
                          >
                            Verified Receipt ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEDICATED STUDENT SCREENSHOT & AI FORENSIC AUDIT MODAL */}
      {viewingScreenshotRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Student Payment Screenshot & Proof</span>
                    <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded">
                      Teacher Review
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Student: <strong>{viewingScreenshotRecord.studentName}</strong> · Batch: <strong>{viewingScreenshotRecord.batchName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingScreenshotRecord(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Screenshot Display Box */}
              {viewingScreenshotRecord.screenshotUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      Uploaded Payment Screenshot:
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Received from student app
                    </span>
                  </div>
                  <div className="p-4 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-300">
                    <img
                      src={viewingScreenshotRecord.screenshotUrl}
                      alt="Student Receipt"
                      className="max-h-72 rounded-xl shadow-lg border border-slate-300 object-contain bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                  Student submitted payment details without an attached screenshot.
                </div>
              )}

              {/* Transaction Key Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Amount</span>
                  <p className="font-black text-slate-900 text-sm">₹{viewingScreenshotRecord.amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bank UTR</span>
                  <p className="font-mono font-bold text-indigo-700 truncate">{viewingScreenshotRecord.transactionRef || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Paid By</span>
                  <p className="font-bold text-slate-800 truncate">{viewingScreenshotRecord.paidBy || viewingScreenshotRecord.studentName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Paid To</span>
                  <p className="font-bold text-slate-800 truncate">{viewingScreenshotRecord.paidTo || 'Faculty UPI'}</p>
                </div>
              </div>

              {/* Algorithmic Verification Report */}
              <div
                className={`p-4 rounded-2xl border ${
                  viewingScreenshotRecord.isFlaggedAsProxy || viewingScreenshotRecord.aiAnalysis?.isProxy
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : viewingScreenshotRecord.aiAnalysis?.verdict === 'VERIFIED_GENUINE'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  {viewingScreenshotRecord.isFlaggedAsProxy || viewingScreenshotRecord.aiAnalysis?.isProxy ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {viewingScreenshotRecord.isFlaggedAsProxy || viewingScreenshotRecord.aiAnalysis?.isProxy
                      ? '🚨 PROXY DUPLICATE RECEIPT WARNING'
                      : viewingScreenshotRecord.aiAnalysis?.verdict || 'GENUINE PAYMENT RECORD'}
                  </h4>
                </div>
                <p className="text-xs mt-1 leading-relaxed font-medium">
                  {viewingScreenshotRecord.aiAnalysis?.forensicSummary ||
                    'Student payment reference and screenshot match expected parameters.'}
                </p>
                {viewingScreenshotRecord.aiAnalysis?.confidenceScore !== undefined && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold">
                    <span>Algorithmic Legitimacy Confidence:</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border">
                      {viewingScreenshotRecord.aiAnalysis.confidenceScore}%
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Teacher */}
              <div className="pt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingScreenshotRecord(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95"
                >
                  Close
                </button>

                {viewingScreenshotRecord.status === 'verification_pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        verifyFeePayment(viewingScreenshotRecord.id, false, 'Rejected by teacher: Invalid screenshot or duplicate attempt.', true);
                        setViewingScreenshotRecord(null);
                      }}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      Reject Screenshot
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        verifyFeePayment(viewingScreenshotRecord.id, true);
                        setViewingScreenshotRecord(null);
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve & Issue Receipt
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE MONTHLY FEES MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Generate Monthly Invoices</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleGenerateMonth} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Batch</label>
                <select
                  value={genBatchId}
                  onChange={(e) => setGenBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  {myBatches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Month Cycle</label>
                <input
                  type="text"
                  required
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Set Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={genDueDate}
                  onChange={(e) => setGenDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Create Invoices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
