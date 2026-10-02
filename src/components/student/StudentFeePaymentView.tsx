import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeeRecord } from '../../types';
import { QRCodeModal } from '../common/QRCodeModal';
import { 
  DollarSign, 
  QrCode, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download, 
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
  Eye,
  X
} from 'lucide-react';

export const StudentFeePaymentView: React.FC = () => {
  const { currentUser, feeRecords, users } = useApp();
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<FeeRecord | null>(null);
  const [viewingScreenshotUrl, setViewingScreenshotUrl] = useState<string | null>(null);

  if (!currentUser) return null;

  const myFees = feeRecords.filter((f) => f.studentId === currentUser.id);

  // Helper for due date calculation
  const getDueDaysRemaining = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Tuition Fee Portal & QR Payment
            </h2>
            <span className="text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-3 py-0.5 rounded-full">
              UPI + Screenshot Proof
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scan your batch QR code to pay via UPI. Students must upload a screenshot of successful payment which goes directly to your teacher for approval.
          </p>
        </div>
      </div>

      {/* Fee Invoices List */}
      {myFees.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400">
          No fee invoices currently assigned to your account.
        </div>
      ) : (
        <div className="space-y-4">
          {myFees.map((fee) => {
            const daysLeft = getDueDaysRemaining(fee.dueDate);
            const isOverdue = fee.status === 'overdue' || (fee.status === 'pending' && daysLeft < 0);
            const teacher = users.find((u) => u.id === fee.teacherId);

            return (
              <div
                key={fee.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs transition-all ${
                  isOverdue
                    ? 'border-rose-300 ring-1 ring-rose-300/40'
                    : fee.status === 'paid'
                    ? 'border-emerald-200'
                    : fee.status === 'verification_pending'
                    ? 'border-blue-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                        {fee.batchName}
                      </span>
                      <span className="text-xs font-bold text-slate-700">· {fee.month}</span>

                      {/* Status Badge */}
                      <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${
                        fee.isFlaggedAsProxy || fee.aiAnalysis?.isProxy
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          : fee.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fee.status === 'verification_pending'
                          ? 'bg-blue-100 text-blue-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {fee.isFlaggedAsProxy || fee.aiAnalysis?.isProxy ? '🚨 Proxy Review Required' : fee.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Teacher Due Date: <strong className="text-slate-900">{fee.dueDate}</strong>
                      </span>
                      {teacher && (
                        <span>
                          Instructor: <strong className="text-blue-700">{teacher.name}</strong>
                        </span>
                      )}
                    </div>

                    {/* Automated Due Date Reminder Banner */}
                    {fee.status !== 'paid' && (
                      <div className="flex items-center gap-2 pt-1">
                        {daysLeft < 0 ? (
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Overdue by {Math.abs(daysLeft)} day(s)! Please pay promptly.
                          </span>
                        ) : daysLeft === 0 ? (
                          <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Tuition due TODAY!
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-600 flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-xl">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Due in <strong>{daysLeft} days</strong> ({fee.dueDate})
                          </span>
                        )}

                        {fee.reminderCount > 0 && (
                          <span className="text-[11px] text-slate-400">
                            (Reminder sent by teacher)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Screenshot Delivered Status Banner */}
                    {fee.screenshotUrl && (
                      <div className="flex items-center gap-3 pt-2">
                        <div
                          onClick={() => setViewingScreenshotUrl(fee.screenshotUrl || null)}
                          className="w-12 h-14 rounded-lg bg-slate-100 border border-slate-300 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all shrink-0"
                          title="Click to view submitted screenshot"
                        >
                          <img
                            src={fee.screenshotUrl}
                            alt="Your proof"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-blue-900 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                            Payment Screenshot Delivered to Teacher
                          </p>
                          <p className="text-[11px] text-slate-500">
                            UTR: <strong className="font-mono text-slate-800">{fee.transactionRef}</strong> · {fee.paidTime || 'Completed'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Amount & Pay Button */}
                  <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 font-medium">Payable Amount</span>
                      <p className="text-2xl font-black text-slate-900 leading-none mt-0.5">
                        ₹{fee.amount.toLocaleString()}
                      </p>
                    </div>

                    {fee.status === 'paid' ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        <span>Teacher Approved ({fee.receiptUrl || 'REC-VERIFIED'})</span>
                      </div>
                    ) : (fee.isFlaggedAsProxy || fee.aiAnalysis?.isProxy) ? (
                      <div className="space-y-1.5 text-left sm:text-right">
                        <div className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                          🚨 Proxy Alert: Collision Detected
                        </div>
                        <button
                          onClick={() => setSelectedFeeForPayment(fee)}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline block"
                        >
                          Re-upload Genuine Screenshot & UTR →
                        </button>
                      </div>
                    ) : fee.status === 'verification_pending' ? (
                      <div className="text-left sm:text-right space-y-1">
                        <div className="text-xs font-black text-blue-800 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Sent to Teacher for Approval</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Teacher {teacher?.name || 'Faculty'} is reviewing screenshot
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedFeeForPayment(fee)}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95"
                      >
                        <QrCode className="w-4 h-4" />
                        Pay with Interactive QR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Payment Modal with Mandatory Screenshot */}
      {selectedFeeForPayment && (
        <QRCodeModal
          feeRecord={selectedFeeForPayment}
          onClose={() => setSelectedFeeForPayment(null)}
        />
      )}

      {/* Screenshot Lightbox Modal */}
      {viewingScreenshotUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Your Uploaded Payment Screenshot</span>
              <button
                onClick={() => setViewingScreenshotUrl(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-100 rounded-2xl p-3 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={viewingScreenshotUrl}
                alt="Enlarged Screenshot"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
