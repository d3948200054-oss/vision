import { FeeRecord, PaymentAiAnalysis, PaymentAiVerdict, User } from '../types';

/**
 * Pure Algorithmic Payment AI Verification & Proxy Detection Engine
 * 100% self-contained client-side algorithms - NO external AI API key or network dependency.
 *
 * Primary Factors Analyzed:
 * 1. Time & Date Plausibility
 * 2. Paid To Whom (Recipient UPI & Payee Identity)
 * 3. Paid By Whom (Sender Identity vs Student / Parent credentials)
 * 4. Amount Verification (Expected batch fee vs Transferred amount)
 * 5. PROXY & REUSED SCREENSHOT DETECTION (Perceptual hash collision, UTR reuse, Cross-student match)
 */

export interface PaymentSubmissionInput {
  amount: number;
  transactionRef: string;
  paymentMethod: string;
  paidTo: string;
  paidBy: string;
  paidDate: string; // YYYY-MM-DD
  paidTime?: string; // HH:MM or 12h format
  screenshotDataUrl?: string;
  receiptText?: string;
}

/**
 * Computes a fast perceptual hash (dHash) of an image using canvas
 * Returns a 64-bit hexadecimal fingerprint string
 */
export async function computeImagePerceptualHash(imageDataUrlOrBlob: string): Promise<string> {
  if (!imageDataUrlOrBlob) {
    return '0000000000000000';
  }

  return new Promise((resolve) => {
    // If running in browser with Image & Canvas support
    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const width = 9;
          const height = 8;
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(computeFallbackStringHash(imageDataUrlOrBlob));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const imgData = ctx.getImageData(0, 0, width, height);
          const pixels = imgData.data;

          // Compute grayscale luminance for each pixel
          const grays: number[][] = [];
          for (let y = 0; y < height; y++) {
            grays[y] = [];
            for (let x = 0; x < width; x++) {
              const idx = (y * width + x) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              // Rec. 601 luma formula
              grays[y][x] = 0.299 * r + 0.587 * g + 0.114 * b;
            }
          }

          // Compute difference hash (left pixel vs right pixel) -> 64 bits
          let bitString = '';
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width - 1; x++) {
              bitString += grays[y][x] > grays[y][x + 1] ? '1' : '0';
            }
          }

          // Convert 64-bit binary string to 16-character hex
          let hexHash = '';
          for (let i = 0; i < bitString.length; i += 4) {
            const nibble = bitString.substring(i, i + 4);
            hexHash += parseInt(nibble, 2).toString(16);
          }

          resolve(hexHash);
        } catch {
          resolve(computeFallbackStringHash(imageDataUrlOrBlob));
        }
      };

      img.onerror = () => {
        resolve(computeFallbackStringHash(imageDataUrlOrBlob));
      };

      img.src = imageDataUrlOrBlob;
    } else {
      resolve(computeFallbackStringHash(imageDataUrlOrBlob));
    }
  });
}

/**
 * Fallback deterministic string hash for mock receipts or environments without canvas
 */
export function computeFallbackStringHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return p1 + p2;
}

/**
 * Calculates Hamming distance between two hex hashes (number of differing bits)
 */
export function calculateHammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 64;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const n1 = parseInt(hash1[i], 16);
    const n2 = parseInt(hash2[i], 16);
    let xor = n1 ^ n2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/**
 * Clean & normalize string for fuzzy comparison
 */
function normalizeString(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Token overlap similarity (0 to 1)
 */
function tokenSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;

  const tokens1 = new Set(norm1.split(' ').filter((t) => t.length > 2));
  const tokens2 = new Set(norm2.split(' ').filter((t) => t.length > 2));
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let matches = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) matches++;
  });

  return (2 * matches) / (tokens1.size + tokens2.size);
}

/**
 * MAIN ALGORITHMIC ENGINE:
 * Evaluates payment submission against expected fee record and all existing records
 */
export async function runPaymentAiFraudDetection(
  currentRecord: FeeRecord,
  submission: PaymentSubmissionInput,
  allFeeRecords: FeeRecord[],
  allUsers: User[],
  studentUser?: User,
  teacherUser?: User
): Promise<PaymentAiAnalysis> {
  const analyzedAt = new Date().toISOString();

  // 1. Compute screenshot hash if provided
  let currentScreenshotHash = '';
  if (submission.screenshotDataUrl) {
    currentScreenshotHash = await computeImagePerceptualHash(submission.screenshotDataUrl);
  }

  // Factor 1: AMOUNT CHECK
  const expectedAmount = currentRecord.amount;
  const submittedAmount = Number(submission.amount) || 0;
  let amountValid = false;
  let amountScore = 0;
  let amountNote = '';

  if (submittedAmount === expectedAmount) {
    amountValid = true;
    amountScore = 20;
    amountNote = `Exact amount match: ₹${submittedAmount.toLocaleString()} matches required ₹${expectedAmount.toLocaleString()}.`;
  } else if (submittedAmount > expectedAmount) {
    amountValid = true;
    amountScore = 18;
    amountNote = `Overpayment detected: ₹${submittedAmount.toLocaleString()} (required: ₹${expectedAmount.toLocaleString()}). Validated.`;
  } else {
    amountValid = false;
    amountScore = -25;
    amountNote = `Underpayment: Only ₹${submittedAmount.toLocaleString()} submitted but expected fee is ₹${expectedAmount.toLocaleString()} (shortage of ₹${expectedAmount - submittedAmount}).`;
  }

  // Factor 2: PAID TO WHOM (Recipient check)
  const expectedTeacherUpi = teacherUser?.upiId || 'visionclasses@upi';
  const normPaidTo = normalizeString(submission.paidTo);
  const normTeacherUpi = normalizeString(expectedTeacherUpi);
  let recipientValid = false;
  let recipientScore = 0;
  let recipientNote = '';

  const isOfficialInstitute = 
    normPaidTo.includes('vision') || 
    normPaidTo.includes('classes') || 
    normPaidTo.includes('omshankar') ||
    normPaidTo.includes(normTeacherUpi.replace(/[^a-z0-9]/g, '')) ||
    tokenSimilarity(submission.paidTo, expectedTeacherUpi) > 0.4;

  if (isOfficialInstitute) {
    recipientValid = true;
    recipientScore = 20;
    recipientNote = `Recipient verified: Paid to official institute/faculty account "${submission.paidTo}" (Expected: ${expectedTeacherUpi}).`;
  } else if (submission.paidTo.trim().length > 3) {
    recipientValid = false;
    recipientScore = -30;
    recipientNote = `Recipient mismatch: Paid to "${submission.paidTo}", which does not match faculty UPI "${expectedTeacherUpi}" or Vision Classes.`;
  } else {
    recipientValid = false;
    recipientScore = -15;
    recipientNote = 'No recognized payee UPI specified in submission.';
  }

  // Factor 3: PAID BY WHOM (Sender match vs student or parent)
  const studentName = studentUser?.name || currentRecord.studentName;
  const parentName = studentUser?.parentName || '';
  const submittedPayer = submission.paidBy || '';
  let payerValid = false;
  let payerScore = 0;
  let payerNote = '';

  const simWithStudent = tokenSimilarity(submittedPayer, studentName);
  const simWithParent = parentName ? tokenSimilarity(submittedPayer, parentName) : 0;

  // Cross check if payer matches ANOTHER student in the institute (Proxy warning)
  const otherStudents = allUsers.filter((u) => u.role === 'student' && u.id !== currentRecord.studentId);
  const proxyStudentMatch = otherStudents.find((u) => tokenSimilarity(submittedPayer, u.name) > 0.7);

  if (proxyStudentMatch) {
    payerValid = false;
    payerScore = -40;
    payerNote = `🚨 PROXY IDENTITY ALERT: Payment was made by "${submittedPayer}", which matches another registered student: "${proxyStudentMatch.name}" (${proxyStudentMatch.grade})!`;
  } else if (simWithStudent >= 0.5) {
    payerValid = true;
    payerScore = 20;
    payerNote = `Sender verified: Matches enrolled student name "${studentName}".`;
  } else if (simWithParent >= 0.5) {
    payerValid = true;
    payerScore = 20;
    payerNote = `Sender verified: Matches student's registered parent/guardian "${parentName}".`;
  } else if (submittedPayer.length > 2) {
    payerValid = true;
    payerScore = 10;
    payerNote = `Payer "${submittedPayer}" recorded (Not identical to student name "${studentName}" or parent "${parentName}", manual note recommended).`;
  } else {
    payerValid = false;
    payerScore = 0;
    payerNote = 'Payer identity empty or unverified.';
  }

  // Factor 4: TIME & DATE PLAUSIBILITY
  let dateValid = true;
  let dateScore = 20;
  let dateNote = '';
  const now = new Date();

  if (submission.paidDate) {
    const paidDateObj = new Date(submission.paidDate);
    const diffDays = Math.round((now.getTime() - paidDateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < -1) {
      dateValid = false;
      dateScore = -30;
      dateNote = `Invalid future timestamp: Payment date ${submission.paidDate} is in the future.`;
    } else if (diffDays > 90) {
      dateValid = false;
      dateScore = -20;
      dateNote = `Expired screenshot/date: Payment date ${submission.paidDate} is older than 90 days.`;
    } else {
      dateValid = true;
      dateScore = 20;
      dateNote = `Date validated: Payment timestamp ${submission.paidDate} ${submission.paidTime || ''} is fresh within the current billing cycle (${diffDays} days ago).`;
    }
  } else {
    dateValid = true;
    dateScore = 10;
    dateNote = 'Payment date not explicitly specified, assuming today.';
  }

  // Factor 5: PROXY & DUPLICATE DETECTION (The Core User Feature)
  // Check against all OTHER fee submissions in the institute database!
  let isDuplicate = false;
  let duplicateType: 'screenshot' | 'utr' | 'timestamp' | undefined = undefined;
  let duplicateCollisionDetails: string | undefined = undefined;
  let duplicateScore = 20;
  let matchedRecordId: string | undefined = undefined;
  let matchedStudentName: string | undefined = undefined;
  let matchedTimestamp: string | undefined = undefined;

  const currentUtrClean = (submission.transactionRef || '').trim().toUpperCase();

  // Search other fee records (excluding this current record itself)
  for (const other of allFeeRecords) {
    if (other.id === currentRecord.id) continue;

    // A. Check UTR Collision
    const otherUtr = (other.transactionRef || '').trim().toUpperCase();
    if (currentUtrClean && otherUtr && currentUtrClean.length >= 6 && currentUtrClean === otherUtr) {
      isDuplicate = true;
      duplicateType = 'utr';
      matchedRecordId = other.id;
      matchedStudentName = other.studentName;
      matchedTimestamp = other.paidAt || other.dueDate;
      duplicateCollisionDetails = `Identical UTR / Transaction Ref "${currentUtrClean}" was already claimed by student "${other.studentName}" for ${other.batchName} (${other.month}) on ${matchedTimestamp}!`;
      duplicateScore = -85;
      break;
    }

    // B. Check Perceptual Screenshot Hash Match
    if (currentScreenshotHash && other.screenshotHash) {
      const dist = calculateHammingDistance(currentScreenshotHash, other.screenshotHash);
      // Distance <= 4 means visually identical screenshot!
      if (dist <= 4) {
        isDuplicate = true;
        duplicateType = 'screenshot';
        matchedRecordId = other.id;
        matchedStudentName = other.studentName;
        matchedTimestamp = other.paidAt || other.dueDate;
        duplicateCollisionDetails = `Perceptual Screenshot Match (Hamming distance ${dist}/64)! This exact fee receipt screenshot was previously submitted by student "${other.studentName}" on ${matchedTimestamp}!`;
        duplicateScore = -95;
        break;
      }
    }

    // C. Check Exact Minute & Amount Collision across two different students
    if (
      submission.paidDate &&
      submission.paidTime &&
      other.studentId !== currentRecord.studentId &&
      other.paidAt &&
      other.amount === submittedAmount
    ) {
      const otherDate = other.paidAt.split('T')[0];
      if (otherDate === submission.paidDate && other.paidTime === submission.paidTime) {
        isDuplicate = true;
        duplicateType = 'timestamp';
        matchedRecordId = other.id;
        matchedStudentName = other.studentName;
        matchedTimestamp = other.paidAt;
        duplicateCollisionDetails = `Exact timestamp collision: Identical amount ₹${submittedAmount} at exact time ${submission.paidTime} on ${submission.paidDate} already submitted by "${other.studentName}".`;
        duplicateScore = -60;
        break;
      }
    }
  }

  // Calculate Overall Confidence & Verdict
  const totalScore = Math.max(0, Math.min(100, amountScore + recipientScore + payerScore + dateScore + duplicateScore));

  let verdict: PaymentAiVerdict = 'VERIFIED_GENUINE';
  let isProxy = false;
  let proxyReason = '';
  let recommendedAction: 'APPROVE' | 'FLAG_AS_PROXY' | 'REQUEST_ORIGINAL_RECEIPT' | 'REJECT' = 'APPROVE';

  if (isDuplicate) {
    verdict = 'PROXY_DETECTED';
    isProxy = true;
    proxyReason = duplicateCollisionDetails || 'Duplicate screenshot or UTR already used by another student.';
    recommendedAction = 'FLAG_AS_PROXY';
  } else if (proxyStudentMatch) {
    verdict = 'PROXY_DETECTED';
    isProxy = true;
    proxyReason = `Payer "${submittedPayer}" is another student (${proxyStudentMatch.name}), suspected proxy submission.`;
    recommendedAction = 'FLAG_AS_PROXY';
  } else if (!amountValid) {
    verdict = 'AMOUNT_MISMATCH';
    recommendedAction = 'REJECT';
  } else if (!recipientValid) {
    verdict = 'RECIPIENT_MISMATCH';
    recommendedAction = 'REQUEST_ORIGINAL_RECEIPT';
  } else if (totalScore < 60) {
    verdict = 'SUSPICIOUS';
    recommendedAction = 'REQUEST_ORIGINAL_RECEIPT';
  } else {
    verdict = 'VERIFIED_GENUINE';
    recommendedAction = 'APPROVE';
  }

  const forensicSummary = isProxy
    ? `🚨 PROXY DETECTED by Algorithmic AI: ${proxyReason}`
    : verdict === 'VERIFIED_GENUINE'
    ? `✅ Payment verified legitimate (Confidence: ${totalScore}%). Amount ₹${submittedAmount}, recipient ${submission.paidTo}, payer ${submittedPayer || studentName}, and UTR uniqueness confirmed.`
    : `⚠️ Flagged by Algorithmic AI: ${amountNote || recipientNote || 'Inconsistencies detected.'}`;

  return {
    verdict,
    isProxy,
    confidenceScore: totalScore,
    proxyReason: isProxy ? proxyReason : undefined,
    matchedRecordId,
    matchedStudentName,
    matchedTimestamp,
    factors: {
      amountMatch: {
        valid: amountValid,
        expected: expectedAmount,
        submitted: submittedAmount,
        score: amountScore,
        note: amountNote,
      },
      recipientMatch: {
        valid: recipientValid,
        expected: expectedTeacherUpi,
        submitted: submission.paidTo,
        score: recipientScore,
        note: recipientNote,
      },
      payerMatch: {
        valid: payerValid,
        studentName,
        parentName,
        submittedPayer,
        score: payerScore,
        note: payerNote,
      },
      dateTimeMatch: {
        valid: dateValid,
        submittedDate: submission.paidDate,
        submittedTime: submission.paidTime,
        score: dateScore,
        note: dateNote,
      },
      duplicateCheck: {
        isDuplicate,
        duplicateType,
        collisionDetails: duplicateCollisionDetails,
        score: duplicateScore,
      },
    },
    forensicSummary,
    recommendedAction,
    analyzedAt,
  };
}

/**
 * Generates sample realistic digital receipt canvases for test simulations (GPay, PhonePe, Paytm, or Duplicate Proxy Receipt)
 */
export function generateSyntheticReceipt(
  type: 'gpay' | 'phonepe' | 'paytm' | 'duplicate_proxy',
  amount: number,
  payeeUpi: string,
  payerName: string,
  utr: string,
  dateStr: string,
  timeStr: string
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const isGpay = type === 'gpay';
  const isPhonePe = type === 'phonepe';
  const isPaytm = type === 'paytm';
  const isDuplicate = type === 'duplicate_proxy';

  const headerColor = isPhonePe ? '#5f259f' : isPaytm ? '#00b9f5' : isDuplicate ? '#b91c1c' : '#1a73e8';

  // Card background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 400, 540);

  // Header band
  ctx.fillStyle = headerColor;
  ctx.fillRect(0, 0, 400, 110);

  // App Logo text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(isPhonePe ? 'PhonePe' : isPaytm ? 'Paytm' : isDuplicate ? '⚠️ REUSED RECEIPT PROXY' : 'Google Pay', 24, 45);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Payment Successful · Completed', 24, 75);

  // Main white receipt card
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillRect(20, 95, 360, 415);
  ctx.shadowColor = 'transparent';

  // Amount
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(`₹${amount.toLocaleString()}`, 40, 155);

  // Checkmark circle
  ctx.fillStyle = isDuplicate ? '#ef4444' : '#10b981';
  ctx.beginPath();
  ctx.arc(330, 145, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('✓', 323, 151);

  // Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 185);
  ctx.lineTo(360, 185);
  ctx.stroke();

  // Details fields
  const drawRow = (label: string, value: string, y: number, isMono = false) => {
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText(label, 40, y);
    ctx.fillStyle = '#0f172a';
    ctx.font = isMono ? 'bold 12px monospace' : 'bold 13px sans-serif';
    ctx.fillText(value, 40, y + 18);
  };

  drawRow('Paid to', payeeUpi, 215);
  drawRow('Paid by', payerName, 265);
  drawRow('UPI Transaction ID / UTR', utr, 315, true);
  drawRow('Date & Time', `${dateStr} · ${timeStr}`, 365);
  drawRow('Payment Type', isDuplicate ? 'Borrowed/Reused Screenshot' : 'Tuition Fee Payment (Vision Classes)', 415);

  // Security badge
  ctx.fillStyle = isDuplicate ? '#fef2f2' : '#f0fdf4';
  ctx.fillRect(40, 455, 320, 36);
  ctx.fillStyle = isDuplicate ? '#991b1b' : '#166534';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(isDuplicate ? '⚠️ DUPLICATE TEST RECEIPT (FOR PROXY TESTING)' : '🔒 Verified NPCI / Bank Digital Timestamp', 55, 477);

  return canvas.toDataURL('image/png');
}
