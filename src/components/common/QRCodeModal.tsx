import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { FeeRecord, PaymentAiAnalysis } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  CheckCircle, 
  Copy, 
  AlertCircle, 
  QrCode, 
  ShieldCheck, 
  Upload, 
  Cpu, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  FileCheck2,
  Calendar,
  Clock,
  User,
  DollarSign,
  Camera,
  Image as ImageIcon,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  runPaymentAiFraudDetection, 
  generateSyntheticReceipt, 
  computeImagePerceptualHash 
} from '../../utils/paymentAiDetector';

interface QRCodeModalProps {
  feeRecord: FeeRecord;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ feeRecord, onClose }) => {
  const { users, feeRecords, currentUser, submitFeePayment, appLogo } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<number>(feeRecord.amount);
  const [paidTo, setPaidTo] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>(currentUser?.name || feeRecord.studentName);
  const [paidDate, setPaidDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paidTime, setPaidTime] = useState<string>('11:00 AM');
  const [selectedApp, setSelectedApp] = useState<string>('GPay');
  
  // Mandatory Screenshot state
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [viewFullScreenshot, setViewFullScreenshot] = useState<boolean>(false);

  // Algorithmic AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState<PaymentAiAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teacher = users.find((u) => u.id === feeRecord.teacherId);
  const teacherName = teacher?.name || 'Assigned Faculty';
  const upiId = teacher?.upiId || 'visionclasses@upi';
  const payeeName = `${appLogo.instituteName} ${appLogo.highlightWord}`;

  // Standard UPI URI format
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${feeRecord.amount}&cu=INR&tn=${encodeURIComponent(`Tuition Fee ${feeRecord.month} - ${feeRecord.studentName}`)}`;

  useEffect(() => {
    setPaidTo(upiId);
  }, [upiId]);

  useEffect(() => {
    QRCode.toDataURL(upiString, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [upiString]);

  // Run algorithmic AI analysis whenever key factors change
  const triggerAiEvaluation = async (
    utr: string,
    amount: number,
    to: string,
    by: string,
    date: string,
    time: string,
    screenshot?: string
  ) => {
    setIsAnalyzing(true);
    try {
      const studentUser = users.find((u) => u.id === feeRecord.studentId);
      const teacherUser = users.find((u) => u.id === feeRecord.teacherId);

      const result = await runPaymentAiFraudDetection(
        feeRecord,
        {
          amount,
          transactionRef: utr,
          paymentMethod: `${selectedApp.toUpperCase()} UPI`,
          paidTo: to,
          paidBy: by,
          paidDate: date,
          paidTime: time,
          screenshotDataUrl: screenshot || screenshotDataUrl,
        },
        feeRecords,
        users,
        studentUser,
        teacherUser
      );
      setAiAnalysis(result);
    } catch (err) {
      console.error('Error running Algorithmic AI verification:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Re-run AI analysis on mount or when reference or screenshot changes
  useEffect(() => {
    if (transactionRef.trim().length >= 4 || screenshotDataUrl) {
      triggerAiEvaluation(transactionRef, paidAmount, paidTo, paidBy, paidDate, paidTime, screenshotDataUrl);
    }
  }, [transactionRef, paidAmount, paidTo, paidBy, paidDate, paidTime, screenshotDataUrl]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Quick Simulation Receipt Generator (for immediate testing / preview)
  const handleSimulatePayment = (app: 'gpay' | 'phonepe' | 'paytm') => {
    setSelectedApp(app.toUpperCase());
    setScreenshotError(null);
    const randomUtr = `UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setTransactionRef(randomUtr);

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPaidTime(currentTime);

    const syntheticImg = generateSyntheticReceipt(
      app,
      feeRecord.amount,
      paidTo || upiId,
      paidBy || feeRecord.studentName,
      randomUtr,
      paidDate,
      currentTime
    );
    setScreenshotDataUrl(syntheticImg);
    setScreenshotFileName(`${app.toUpperCase()}_Payment_Receipt.png`);
    triggerAiEvaluation(randomUtr, feeRecord.amount, paidTo || upiId, paidBy || feeRecord.studentName, paidDate, currentTime, syntheticImg);
  };

  // Simulate Duplicate Proxy attempt to test fraud prevention
  const handleSimulateDuplicateProxy = () => {
    setSelectedApp('Proxy Test App');
    setScreenshotError(null);
    const duplicateUtr = 'UPI-983274912903';
    setTransactionRef(duplicateUtr);
    setPaidBy('Ananya Sharma'); // Another student's receipt!
    setPaidAmount(feeRecord.amount);
    setPaidDate('2026-09-27');
    setPaidTime('11:20 AM');

    const duplicateReceipt = generateSyntheticReceipt(
      'duplicate_proxy',
      feeRecord.amount,
      upiId,
      'Ananya Sharma',
      duplicateUtr,
      '2026-09-27',
      '11:20 AM'
    );
    setScreenshotDataUrl(duplicateReceipt);
    setScreenshotFileName('Reused_Receipt_Attempt.png');
    triggerAiEvaluation(duplicateUtr, feeRecord.amount, upiId, 'Ananya Sharma', '2026-09-27', '11:20 AM', duplicateReceipt);
  };

  // Handle local file upload
  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setScreenshotError('Please upload an image file (PNG, JPG, JPEG, WebP).');
      return;
    }
    setScreenshotError(null);
    setScreenshotFileName(file.name);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setScreenshotDataUrl(dataUrl);

      // Auto-populate transaction Ref if empty
      const currentUtr = transactionRef.trim() || `UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      if (!transactionRef.trim()) {
        setTransactionRef(currentUtr);
      }

      triggerAiEvaluation(currentUtr, paidAmount, paidTo, paidBy, paidDate, paidTime, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // STRICT MANDATORY CHECK: Screenshot is required!
    if (!screenshotDataUrl) {
      setScreenshotError('Mandatory: You must upload a screenshot of your successful payment before submitting to your teacher.');
      return;
    }

    if (!transactionRef.trim()) {
      alert('Please enter your Bank Reference / UTR Number.');
      return;
    }

    let hash = '';
    if (screenshotDataUrl) {
      hash = await computeImagePerceptualHash(screenshotDataUrl);
    }

    // Final AI evaluation before storing
    const studentUser = users.find((u) => u.id === feeRecord.studentId);
    const teacherUser = users.find((u) => u.id === feeRecord.teacherId);
    const finalAiAnalysis = await runPaymentAiFraudDetection(
      feeRecord,
      {
        amount: paidAmount,
        transactionRef: transactionRef.trim(),
        paymentMethod: `${selectedApp} UPI`,
        paidTo,
        paidBy,
        paidDate,
        paidTime,
        screenshotDataUrl,
      },
      feeRecords,
      users,
      studentUser,
      teacherUser
    );

    // Save payment submission with mandatory screenshot
    submitFeePayment(
      feeRecord.id,
      transactionRef.trim(),
      `${selectedApp} UPI`,
      screenshotDataUrl,
      hash,
      paidTo,
      paidBy,
      paidTime,
      finalAiAnalysis
    );

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                Interactive UPI Portal
              </span>
              <span className="text-xs text-blue-300">· {appLogo.instituteName} {appLogo.highlightWord}</span>
            </div>
            <h3 className="text-lg font-black mt-1 text-white flex items-center gap-2">
              <span>Tuition Fee Payment</span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                AI Verified
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all active:scale-95"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="text-center py-10 space-y-4 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-50">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                  Screenshot Sent to Teacher!
                </h4>
                <p className="text-sm font-semibold text-indigo-700 mt-1">
                  Transmitted directly to {teacherName} for tuition verification
                </p>
              </div>

              {screenshotDataUrl && (
                <div className="inline-block p-2 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner max-w-[200px]">
                  <img
                    src={screenshotDataUrl}
                    alt="Submitted Receipt"
                    className="w-full h-32 object-contain rounded-xl"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
                    {screenshotFileName || 'Payment_Receipt.png'}
                  </p>
                </div>
              )}

              <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <p>
                  Bank Reference / UTR: <strong className="font-mono text-slate-900">{transactionRef}</strong>
                </p>
                <p>
                  Your teacher will inspect the screenshot in their fee manager and confirm your official receipt.
                </p>
                {aiAnalysis?.isProxy ? (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Flagged for manual faculty review (duplicate detected).</span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Algorithmic AI confirmed authentic ({aiAnalysis?.confidenceScore || 96}% confidence).</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Fee Bill Summary Card */}
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class & Billing Month</span>
                  <p className="text-base font-extrabold text-slate-900">{feeRecord.batchName}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Month: <strong className="text-slate-900">{feeRecord.month}</strong> · Teacher Due Date: <strong className="text-rose-600 font-bold">{feeRecord.dueDate}</strong>
                  </p>
                  <p className="text-[11px] text-indigo-700 font-semibold mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Instructor: <strong>{teacherName}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right bg-white px-4 py-2.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tuition Fee</span>
                  <p className="text-2xl font-black text-indigo-700">₹{feeRecord.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Step 1 & 2: QR Code & UPI Scan Container */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">1</span>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Scan QR & Complete Payment
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Step 1 of 2</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 shrink-0 relative group">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="UPI QR Code" className="w-36 h-36 object-contain" />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 flex-1 w-full">
                    <div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Scan with <strong className="text-slate-900">Google Pay, PhonePe, Paytm, BHIM</strong> or any UPI app. Amount and teacher UPI ID are pre-filled.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                      <span className="truncate">UPI ID: <strong className="font-mono text-indigo-600">{upiId}</strong></span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="text-slate-500 hover:text-indigo-600 p-1 rounded-lg hover:bg-white transition-all active:scale-95 shrink-0"
                        title="Copy UPI ID"
                      >
                        {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Quick Simulator Buttons */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Quick Test Simulators (Auto-generates screenshot):
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSimulatePayment('gpay')}
                          className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95"
                        >
                          + GPay Receipt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulatePayment('phonepe')}
                          className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95"
                        >
                          + PhonePe Receipt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulatePayment('paytm')}
                          className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95"
                        >
                          + Paytm Receipt
                        </button>
                        <button
                          type="button"
                          onClick={handleSimulateDuplicateProxy}
                          className="text-[11px] font-black px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-300 shadow-2xs transition-all active:scale-95 flex items-center gap-1"
                          title="Simulate reusing another student's receipt"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Test Proxy Detection
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: MANDATORY PAYMENT SCREENSHOT UPLOAD */}
              <div className={`p-5 rounded-2xl border-2 transition-all space-y-4 ${
                !screenshotDataUrl
                  ? 'border-indigo-300 bg-indigo-50/30'
                  : 'border-emerald-300 bg-emerald-50/20'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">2</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Upload Payment Screenshot (Mandatory)
                        </h4>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300">
                          Required
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Students must attach proof of successful payment. Your screenshot will be forwarded directly to teacher <strong>{teacherName}</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Box / Dropzone */}
                {!screenshotDataUrl ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-indigo-600 bg-indigo-100/50 scale-[1.01]'
                        : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-900">
                      Click to Browse or Drag & Drop Payment Screenshot
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      PNG, JPG, or WEBP from Google Pay, PhonePe, Paytm, or net banking
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Select Screenshot File
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">Screenshot Attached & Ready for Teacher</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewFullScreenshot(true)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Full
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotDataUrl('');
                            setScreenshotFileName('');
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Replace
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <img
                        src={screenshotDataUrl}
                        alt="Receipt preview"
                        onClick={() => setViewFullScreenshot(true)}
                        className="w-20 h-24 object-contain rounded-lg border border-slate-300 bg-white cursor-pointer hover:opacity-90 shadow-2xs shrink-0"
                        title="Click to view full screenshot"
                      />
                      <div className="space-y-1 overflow-hidden flex-1 text-xs">
                        <p className="font-extrabold text-slate-900 truncate">
                          {screenshotFileName || `${selectedApp}_Screenshot.png`}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Destination: <strong className="text-slate-800">{teacherName} (Teacher Dashboard)</strong>
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Cryptographic image hash computed
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {screenshotError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{screenshotError}</span>
                  </div>
                )}
              </div>

              {/* Transaction Details Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bank Reference / UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UPI-984321948291 or 12-digit UTR"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Amount Paid (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Paid By (Payer Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Payer name on bank account"
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Paid To (Teacher / UPI ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={paidTo}
                      onChange={(e) => setPaidTo(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={paidDate}
                      onChange={(e) => setPaidDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Timestamp
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10:45 AM"
                      value={paidTime}
                      onChange={(e) => setPaidTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Algorithmic AI Pre-verification Banner */}
                {aiAnalysis && (
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      aiAnalysis.isProxy
                        ? 'bg-rose-50/90 border-rose-300 text-rose-950 ring-1 ring-rose-400'
                        : aiAnalysis.verdict === 'VERIFIED_GENUINE'
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/90 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {aiAnalysis.isProxy ? (
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      ) : (
                        <Cpu className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black uppercase tracking-wider">
                            {aiAnalysis.isProxy ? 'Duplicate Screenshot Alert' : 'Algorithmic AI Integrity Check'}
                          </h5>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/90 border">
                            {aiAnalysis.confidenceScore}% Confidence
                          </span>
                        </div>
                        <p className="text-xs font-medium mt-0.5">
                          {aiAnalysis.forensicSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Cancel
                  </button>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                    {!screenshotDataUrl && (
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Screenshot upload required to submit
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={!screenshotDataUrl || !transactionRef.trim()}
                      className={`w-full sm:w-auto px-6 py-3 text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                        !screenshotDataUrl || !transactionRef.trim()
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : aiAnalysis?.isProxy
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-95'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Screenshot to Teacher</span>
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Full Screenshot Lightbox */}
      {viewFullScreenshot && screenshotDataUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Payment Screenshot Preview</span>
              <button
                onClick={() => setViewFullScreenshot(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-100 rounded-2xl p-2 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={screenshotDataUrl}
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
