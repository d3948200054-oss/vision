export type UserRole = 'teacher' | 'student';

export type GradeLevel = 
  | 'Class 5' 
  | 'Class 6' 
  | 'Class 7' 
  | 'Class 8' 
  | 'Class 9' 
  | 'Class 10' 
  | 'Class 11' 
  | 'Class 12';

export interface ClassSubjectAssignment {
  grade: GradeLevel;
  subject: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status?: 'active' | 'suspended';
  createdAt: string;
  
  // Teacher specific
  teacherVerificationKey?: string;
  teacherId?: string;
  subjects?: string[];
  classSubjectAssignments?: ClassSubjectAssignment[];
  bio?: string;
  upiId?: string; // For student fee payments

  // Student specific
  studentId?: string;
  grade?: GradeLevel;
  parentName?: string;
  parentPhone?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  userName: string;
  userRole: UserRole | 'admin';
  details: string;
}

export interface Batch {
  id: string;
  code: string; // Unique joining code e.g. "VC-10-MATH"
  name: string; // e.g. "Class 10 - Mathematics Board Booster"
  grade: GradeLevel;
  subject: string;
  subjectsList?: string[]; // Multiple subjects e.g. ["Mathematics", "Physics"]
  joiningMonth?: string; // Joining batch month e.g. "October 2026"
  teacherId: string;
  teacherName: string;
  schedule: string; // e.g. "Mon, Wed, Fri - 5:00 PM to 6:30 PM"
  roomOrPlatform?: string; // e.g. "Room 204 (Vision Main Campus)"
  monthlyFee: number; // e.g. 2500
  feeDueDateDay: number; // e.g. 5th of each month
  description?: string;
  maxStudents?: number;
  active: boolean;
  createdAt: string;
}

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface JoinRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  grade: GradeLevel;
  batchId: string;
  batchCode: string;
  batchName: string;
  teacherId: string;
  status: JoinRequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName?: string;
  batchId: string;
  batchName?: string;
  teacherId: string;
  enrolledAt: string;
  status: 'active' | 'suspended';
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  batchId: string;
  grade: GradeLevel;
  subject: string;
  teacherId: string;
  teacherName: string;
  fileType: 'pdf' | 'doc' | 'video' | 'notes';
  fileUrl: string;
  fileSize?: string;
  chapter?: string;
  createdAt: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  batchId: string;
  batchName: string;
  grade: GradeLevel;
  subject: string;
  teacherId: string;
  dueDate: string; // ISO date string
  maxMarks: number;
  attachedFileUrl?: string;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  batchId: string;
  submittedAt: string;
  content: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: 'submitted' | 'graded';
  marksObtained?: number;
  feedback?: string;
  gradedAt?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  batchId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
}

export interface TestScore {
  id: string;
  studentId: string;
  batchId: string;
  teacherId: string;
  testName: string; // e.g. "Quadratic Equations Unit Test"
  subject: string;
  marksObtained: number;
  maxMarks: number;
  date: string; // YYYY-MM-DD
  gradeLetter?: string; // A+, A, B, etc.
  feedback?: string;
}

export type FeeStatus = 'paid' | 'pending' | 'overdue' | 'verification_pending';

export type PaymentAiVerdict = 
  | 'VERIFIED_GENUINE' 
  | 'PROXY_DETECTED' 
  | 'SUSPICIOUS' 
  | 'AMOUNT_MISMATCH' 
  | 'RECIPIENT_MISMATCH';

export interface PaymentAiAnalysis {
  verdict: PaymentAiVerdict;
  isProxy: boolean;
  confidenceScore: number; // 0 to 100
  proxyReason?: string;
  matchedRecordId?: string;
  matchedStudentName?: string;
  matchedTimestamp?: string;
  factors: {
    amountMatch: { valid: boolean; expected: number; submitted: number; score: number; note: string };
    recipientMatch: { valid: boolean; expected: string; submitted: string; score: number; note: string };
    payerMatch: { valid: boolean; studentName: string; parentName?: string; submittedPayer: string; score: number; note: string };
    dateTimeMatch: { valid: boolean; submittedDate: string; submittedTime?: string; score: number; note: string };
    duplicateCheck: { isDuplicate: boolean; duplicateType?: 'screenshot' | 'utr' | 'timestamp'; collisionDetails?: string; score: number };
  };
  forensicSummary: string;
  recommendedAction: 'APPROVE' | 'FLAG_AS_PROXY' | 'REQUEST_ORIGINAL_RECEIPT' | 'REJECT';
  analyzedAt: string;
}

export interface AppLogoConfig {
  type: 'icon' | 'image';
  iconName: string; // 'GraduationCap' | 'BookOpen' | 'Award' | 'ShieldCheck' | 'Flame' | 'Sparkles' | 'School'
  imageUrl?: string;
  instituteName: string;
  highlightWord: string;
  tagline: string;
  badgeText: string;
  accentColor: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  teacherId: string;
  month: string; // e.g. "October 2026"
  amount: number;
  dueDate: string; // YYYY-MM-DD set by teacher
  status: FeeStatus;
  paidAt?: string;
  transactionRef?: string; // UTR or UPI ref
  paymentMethod?: string; // 'UPI QR' | 'Cash' | 'NetBanking'
  receiptUrl?: string;
  reminderSentAt?: string;
  createdAt?: string;
  reminderCount: number;

  // Algorithmic AI verification & Proxy audit fields
  screenshotUrl?: string;
  screenshotHash?: string;
  paidTo?: string;
  paidBy?: string;
  paidTime?: string;
  isFlaggedAsProxy?: boolean;
  aiAnalysis?: PaymentAiAnalysis;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
  batchId?: string; // optional context
}

export interface Announcement {
  id: string;
  teacherId: string;
  teacherName: string;
  batchId: string; // 'all' or specific batchId
  batchName: string;
  title: string;
  content: string;
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'fee_reminder' | 'approval' | 'homework' | 'message' | 'attendance';
  linkTab?: string;
  read: boolean;
  createdAt: string;
}

export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

export interface TimetableSlot {
  id: string;
  batchId: string;
  batchName: string;
  grade: GradeLevel;
  day: DayOfWeek;
  startTime: string; // e.g. "05:00 PM"
  endTime: string;   // e.g. "06:30 PM"
  subject: string;
  topic?: string;
  room?: string;
  teacherId: string;
  teacherName: string;
  isSpecialSession?: boolean; // e.g. Doubt solving / weekly test
}
