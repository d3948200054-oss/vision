import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Batch,
  JoinRequest,
  Enrollment,
  StudyMaterial,
  Homework,
  HomeworkSubmission,
  AttendanceRecord,
  TestScore,
  FeeRecord,
  DirectMessage,
  Announcement,
  AppNotification,
  UserRole,
  GradeLevel,
  AttendanceStatus,
  TimetableSlot,
  ActivityLog,
  AppLogoConfig,
  PaymentAiAnalysis,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_BATCHES,
  INITIAL_ENROLLMENTS,
  INITIAL_JOIN_REQUESTS,
  INITIAL_STUDY_MATERIALS,
  INITIAL_HOMEWORKS,
  INITIAL_SUBMISSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_TEST_SCORES,
  INITIAL_FEE_RECORDS,
  INITIAL_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TIMETABLE_SLOTS,
  INITIAL_ACTIVITIES,
  OFFICIAL_TEACHER_ACCESS_KEY,
  SECONDARY_TEACHER_ACCESS_KEY,
} from '../data/mockData';

export const DEFAULT_APP_LOGO: AppLogoConfig = {
  type: 'icon',
  iconName: 'GraduationCap',
  instituteName: 'Vision',
  highlightWord: 'Classes',
  tagline: 'Coaching Management & Personalized Learning Portal',
  badgeText: 'Grades 5–12',
  accentColor: 'blue',
};

interface AppContextType {
  currentUser: User | null;
  users: User[];
  batches: Batch[];
  enrollments: Enrollment[];
  joinRequests: JoinRequest[];
  studyMaterials: StudyMaterial[];
  homeworks: Homework[];
  homeworkSubmissions: HomeworkSubmission[];
  attendanceRecords: AttendanceRecord[];
  testScores: TestScore[];
  feeRecords: FeeRecord[];
  messages: DirectMessage[];
  announcements: Announcement[];
  notifications: AppNotification[];
  timetableSlots: TimetableSlot[];
  activityLogs: ActivityLog[];
  customPasskeys: string[];
  appLogo: AppLogoConfig;

  // Logo & Branding actions
  updateAppLogo: (config: Partial<AppLogoConfig>) => void;
  resetAppLogo: () => void;

  // Dummy Data & Purge actions
  deleteDummyAccountsAndPortalData: () => { deletedUsers: number; deletedBatches: number; deletedRecords: number };
  reloadSampleDemoData: () => void;

  // Auth actions
  login: (emailOrStudentId: string, password?: string, role?: UserRole) => { success: boolean; error?: string };
  lookupStudentAccount: (query: string) => { found: boolean; student?: User; enrolledBatches?: Batch[]; message?: string };
  switchUser: (userId: string) => void;
  logout: () => void;
  registerTeacher: (data: {
    name: string;
    email: string;
    password: string;
    verificationKey: string;
    subjects?: string[];
    classSubjectAssignments: { grade: GradeLevel; subject: string }[];
    phone?: string;
    bio?: string;
    upiId?: string;
    initialBatch?: {
      name: string;
      grade: GradeLevel;
      subject: string;
      monthlyFee: number;
      joiningMonth: string;
      feeDueDateDay?: number;
      schedule?: string;
      description?: string;
    };
  }) => { success: boolean; error?: string };
  registerStudent: (data: {
    name: string;
    email: string;
    password: string;
    grade: GradeLevel;
    phone?: string;
    parentName?: string;
    parentPhone?: string;
  }) => { success: boolean; user?: User; error?: string };
  registerStudentForBatch: (data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    grade?: GradeLevel;
    batchId: string;
    parentName?: string;
    parentPhone?: string;
  }) => { success: boolean; user?: User; error?: string; message?: string };
  teacherCreateStudentForBatch: (
    batchId: string,
    studentData: {
      name: string;
      email: string;
      studentId?: string;
      password?: string;
      phone?: string;
      parentName?: string;
      parentPhone?: string;
      monthlyFee?: number;
      joiningMonth?: string;
    }
  ) => { success: boolean; user?: User; error?: string };

  // Admin actions
  terminateUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  adminAddUser: (data: Partial<User>) => void;
  adminBroadcastNotice: (title: string, message: string) => void;
  addCustomPasskey: (key: string) => void;
  removeCustomPasskey: (key: string) => void;

  // Batch actions
  createBatch: (data: Omit<Batch, 'id' | 'teacherId' | 'teacherName' | 'createdAt' | 'active'>) => Batch;
  updateBatch: (batchId: string, updates: Partial<Batch>) => void;
  updateBatchFeeAndMonth: (batchId: string, monthlyFee: number, joiningMonth: string) => void;
  requestJoinBatch: (batchCode: string, studentId: string) => { success: boolean; message: string; request?: JoinRequest };
  approveJoinRequest: (requestId: string) => void;
  rejectJoinRequest: (requestId: string, reason?: string) => void;

  // Study Materials
  uploadStudyMaterial: (material: Omit<StudyMaterial, 'id' | 'teacherId' | 'teacherName' | 'createdAt'>) => void;
  deleteStudyMaterial: (materialId: string) => void;

  // Homework
  createHomework: (homework: Omit<Homework, 'id' | 'teacherId' | 'createdAt'>) => void;
  submitHomework: (submission: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeHomeworkSubmission: (submissionId: string, marksObtained: number, feedback: string) => void;

  // Attendance
  markBatchAttendance: (records: { studentId: string; studentName: string; batchId: string; date: string; status: AttendanceStatus; remarks?: string }[]) => void;

  // Test Scores
  addTestScore: (score: Omit<TestScore, 'id' | 'teacherId'>) => void;

  // Fees & Reminders
  setFeeDueDate: (feeRecordId: string, newDueDate: string) => void;
  createMonthlyFeesForBatch: (batchId: string, month: string, dueDate: string) => void;
  sendFeeReminder: (feeRecordId: string) => { success: boolean; message: string };
  sendAutomatedBatchFeeReminders: (batchId: string) => number;
  submitFeePayment: (
    feeId: string,
    transactionRef: string,
    paymentMethod: string,
    screenshotUrl?: string,
    screenshotHash?: string,
    paidTo?: string,
    paidBy?: string,
    paidTime?: string,
    aiAnalysis?: PaymentAiAnalysis
  ) => void;
  verifyFeePayment: (feeId: string, approved: boolean, reason?: string, markAsProxy?: boolean) => void;

  // Messaging & Announcements
  sendMessage: (receiverId: string, content: string, batchId?: string) => void;
  markMessageAsRead: (messageId: string) => void;
  postAnnouncement: (announcement: Omit<Announcement, 'id' | 'teacherId' | 'teacherName' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;

  // Timetable
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'teacherId' | 'teacherName'>) => void;
  updateTimetableSlot: (slotId: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (slotId: string) => void;

  // Reset
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'vision_classes_';

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dummyIds = new Set(['student-1', 'student-2', 'student-3', 'student-4', 'student-5', 'student-pending-1']);

  const [users, setUsers] = useState<User[]>(() => {
    const raw = getStoredItem<User[]>('users', INITIAL_USERS);
    // Strict requirement: No dummy accounts visible!
    const clean = raw.filter((u) => !dummyIds.has(u.id));
    return clean.length > 0 ? clean : INITIAL_USERS;
  });
  const [batches, setBatches] = useState<Batch[]>(() => getStoredItem('batches', INITIAL_BATCHES));
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const raw = getStoredItem<Enrollment[]>('enrollments', INITIAL_ENROLLMENTS);
    return raw.filter((e) => !dummyIds.has(e.studentId));
  });
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(() => {
    const raw = getStoredItem<JoinRequest[]>('join_requests', INITIAL_JOIN_REQUESTS);
    return raw.filter((r) => !dummyIds.has(r.studentId));
  });
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => getStoredItem('materials', INITIAL_STUDY_MATERIALS));
  const [homeworks, setHomeworks] = useState<Homework[]>(() => getStoredItem('homeworks', INITIAL_HOMEWORKS));
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>(() => {
    const raw = getStoredItem<HomeworkSubmission[]>('submissions', INITIAL_SUBMISSIONS);
    return raw.filter((s) => !dummyIds.has(s.studentId));
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const raw = getStoredItem<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
    return raw.filter((a) => !dummyIds.has(a.studentId));
  });
  const [testScores, setTestScores] = useState<TestScore[]>(() => {
    const raw = getStoredItem<TestScore[]>('test_scores', INITIAL_TEST_SCORES);
    return raw.filter((t) => !dummyIds.has(t.studentId));
  });
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(() => {
    const raw = getStoredItem<FeeRecord[]>('fee_records', INITIAL_FEE_RECORDS);
    return raw.filter((f) => !dummyIds.has(f.studentId));
  });
  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    const raw = getStoredItem<DirectMessage[]>('messages', INITIAL_MESSAGES);
    return raw.filter((m) => !dummyIds.has(m.senderId) && !dummyIds.has(m.receiverId));
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => getStoredItem('announcements', INITIAL_ANNOUNCEMENTS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredItem('notifications', INITIAL_NOTIFICATIONS));
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => getStoredItem('timetable_slots', INITIAL_TIMETABLE_SLOTS));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => getStoredItem('activity_logs', INITIAL_ACTIVITIES));
  const [customPasskeys, setCustomPasskeys] = useState<string[]>(() =>
    getStoredItem('custom_passkeys', [OFFICIAL_TEACHER_ACCESS_KEY, SECONDARY_TEACHER_ACCESS_KEY])
  );
  const [appLogo, setAppLogo] = useState<AppLogoConfig>(() => getStoredItem('app_logo', DEFAULT_APP_LOGO));

  // Helper to log user and admin activity
  const logActivity = (action: string, userName: string, userRole: UserRole | 'admin', details: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      userName,
      userRole,
      details,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Current logged in user (starts logged out unless session saved)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = getStoredItem<string | null>('current_user_id', null);
    if (!savedUserId) return null;
    const userList = (getStoredItem('users', INITIAL_USERS) as User[]);
    return userList.find((u) => u.id === savedUserId) || null;
  });

  // Sync current user ID to storage
  useEffect(() => {
    if (currentUser) {
      setStoredItem('current_user_id', currentUser.id);
    } else {
      try {
        localStorage.removeItem('current_user_id');
      } catch (e) {
        // ignore
      }
    }
  }, [currentUser]);

  // Sync to localStorage
  useEffect(() => { setStoredItem('users', users); }, [users]);
  useEffect(() => { setStoredItem('batches', batches); }, [batches]);
  useEffect(() => { setStoredItem('enrollments', enrollments); }, [enrollments]);
  useEffect(() => { setStoredItem('join_requests', joinRequests); }, [joinRequests]);
  useEffect(() => { setStoredItem('materials', studyMaterials); }, [studyMaterials]);
  useEffect(() => { setStoredItem('homeworks', homeworks); }, [homeworks]);
  useEffect(() => { setStoredItem('submissions', homeworkSubmissions); }, [homeworkSubmissions]);
  useEffect(() => { setStoredItem('attendance', attendanceRecords); }, [attendanceRecords]);
  useEffect(() => { setStoredItem('test_scores', testScores); }, [testScores]);
  useEffect(() => { setStoredItem('fee_records', feeRecords); }, [feeRecords]);
  useEffect(() => { setStoredItem('messages', messages); }, [messages]);
  useEffect(() => { setStoredItem('announcements', announcements); }, [announcements]);
  useEffect(() => { setStoredItem('notifications', notifications); }, [notifications]);
  useEffect(() => { setStoredItem('timetable_slots', timetableSlots); }, [timetableSlots]);
  useEffect(() => { setStoredItem('activity_logs', activityLogs); }, [activityLogs]);
  useEffect(() => { setStoredItem('custom_passkeys', customPasskeys); }, [customPasskeys]);
  useEffect(() => { setStoredItem('app_logo', appLogo); }, [appLogo]);
  useEffect(() => { setStoredItem('current_user_id', currentUser ? currentUser.id : null); }, [currentUser]);

  // App Logo & Branding Actions
  const updateAppLogo = (updates: Partial<AppLogoConfig>) => {
    setAppLogo((prev) => {
      const next = { ...prev, ...updates };
      logActivity(
        'App Logo & Branding Updated',
        'Omshankar',
        'admin',
        `Brand updated to: "${next.instituteName} ${next.highlightWord}" (${next.tagline})`
      );
      return next;
    });
  };

  const resetAppLogo = () => {
    setAppLogo(DEFAULT_APP_LOGO);
    logActivity('App Logo Reset', 'Omshankar', 'admin', 'Restored default Vision Classes logo & styling.');
  };

  // Dummy Accounts & Portal Data Purge (Clean Slate for Real School Operation)
  const deleteDummyAccountsAndPortalData = (): { deletedUsers: number; deletedBatches: number; deletedRecords: number } => {
    const dummyUserIds = new Set([
      'teacher-1', 'teacher-2',
      'student-1', 'student-2', 'student-3', 'student-4', 'student-5',
      'student-pending-1'
    ]);
    const dummyBatchIds = new Set([
      'batch-10-math', 'batch-12-phy', 'batch-10-sci', 'batch-8-olym', 'batch-11-chem'
    ]);

    const usersBefore = users.length;
    const batchesBefore = batches.length;
    const initialRecordsCount =
      enrollments.length +
      studyMaterials.length +
      homeworks.length +
      homeworkSubmissions.length +
      attendanceRecords.length +
      testScores.length +
      feeRecords.length;

    // Filter out dummy seed users
    const retainedUsers = users.filter((u) => !dummyUserIds.has(u.id));
    // Filter out dummy batches
    const retainedBatches = batches.filter((b) => !dummyBatchIds.has(b.id));

    // Clean portals of dummy data
    const retainedEnrollments = enrollments.filter(
      (e) => !dummyUserIds.has(e.studentId) && !dummyUserIds.has(e.teacherId) && !dummyBatchIds.has(e.batchId)
    );
    const retainedJoinRequests = joinRequests.filter(
      (r) => !dummyUserIds.has(r.studentId) && !dummyBatchIds.has(r.batchId)
    );
    const retainedMaterials = studyMaterials.filter(
      (m) => !dummyUserIds.has(m.teacherId) && !dummyBatchIds.has(m.batchId)
    );
    const retainedHomeworks = homeworks.filter(
      (h) => !dummyUserIds.has(h.teacherId) && !dummyBatchIds.has(h.batchId)
    );
    const retainedSubmissions = homeworkSubmissions.filter(
      (s) => !dummyUserIds.has(s.studentId) && !dummyBatchIds.has(s.batchId)
    );
    const retainedAttendance = attendanceRecords.filter(
      (a) => !dummyUserIds.has(a.studentId) && !dummyUserIds.has(a.teacherId) && !dummyBatchIds.has(a.batchId)
    );
    const retainedScores = testScores.filter(
      (t) => !dummyUserIds.has(t.studentId) && !dummyUserIds.has(t.teacherId) && !dummyBatchIds.has(t.batchId)
    );
    const retainedFees = feeRecords.filter(
      (f) => !dummyUserIds.has(f.studentId) && !dummyUserIds.has(f.teacherId) && !dummyBatchIds.has(f.batchId)
    );
    const retainedMessages = messages.filter(
      (m) => !dummyUserIds.has(m.senderId) && !dummyUserIds.has(m.receiverId)
    );
    const retainedAnnouncements = announcements.filter(
      (a) => !dummyUserIds.has(a.teacherId) && !dummyBatchIds.has(a.batchId)
    );
    const retainedTimetable = timetableSlots.filter(
      (t) => !dummyUserIds.has(t.teacherId) && !dummyBatchIds.has(t.batchId)
    );
    const retainedNotifications = notifications.filter((n) => !dummyUserIds.has(n.userId));

    setUsers(retainedUsers);
    setBatches(retainedBatches);
    setEnrollments(retainedEnrollments);
    setJoinRequests(retainedJoinRequests);
    setStudyMaterials(retainedMaterials);
    setHomeworks(retainedHomeworks);
    setHomeworkSubmissions(retainedSubmissions);
    setAttendanceRecords(retainedAttendance);
    setTestScores(retainedScores);
    setFeeRecords(retainedFees);
    setMessages(retainedMessages);
    setAnnouncements(retainedAnnouncements);
    setTimetableSlots(retainedTimetable);
    setNotifications(retainedNotifications);

    // If active user is one of the dummy accounts, reset current user
    if (currentUser && dummyUserIds.has(currentUser.id)) {
      setCurrentUser(retainedUsers.length > 0 ? retainedUsers[0] : null);
    }

    const deletedUsers = usersBefore - retainedUsers.length;
    const deletedBatches = batchesBefore - retainedBatches.length;
    const deletedRecords =
      initialRecordsCount -
      (retainedEnrollments.length +
        retainedMaterials.length +
        retainedHomeworks.length +
        retainedSubmissions.length +
        retainedAttendance.length +
        retainedScores.length +
        retainedFees.length);

    logActivity(
      'Dummy Accounts & Portals Purged',
      'Omshankar',
      'admin',
      `Purged ${deletedUsers} dummy accounts, ${deletedBatches} dummy batches, and cleaned student & teacher portals.`
    );

    return { deletedUsers, deletedBatches, deletedRecords };
  };

  const reloadSampleDemoData = () => {
    setUsers(INITIAL_USERS);
    setBatches(INITIAL_BATCHES);
    setEnrollments(INITIAL_ENROLLMENTS);
    setJoinRequests(INITIAL_JOIN_REQUESTS);
    setStudyMaterials(INITIAL_STUDY_MATERIALS);
    setHomeworks(INITIAL_HOMEWORKS);
    setHomeworkSubmissions(INITIAL_SUBMISSIONS);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setTestScores(INITIAL_TEST_SCORES);
    setFeeRecords(INITIAL_FEE_RECORDS);
    setMessages(INITIAL_MESSAGES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTimetableSlots(INITIAL_TIMETABLE_SLOTS);
    setCurrentUser(INITIAL_USERS[0]);
    logActivity('Demo Data Restored', 'Omshankar', 'admin', 'Loaded complete sample demo dataset into teacher and student portals.');
  };

  // Auth Functions
  const login = (emailOrStudentId: string, password?: string, role?: UserRole): { success: boolean; error?: string } => {
    const query = emailOrStudentId.toLowerCase().trim();
    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === query || (u.studentId && u.studentId.toLowerCase() === query)) &&
        (!role || u.role === role)
    );

    if (!user) {
      return {
        success: false,
        error: role === 'student'
          ? 'No student account found with this Email or Student ID. In Vision Portal, student accounts must be created by your teacher first. Please contact your instructor for your student credentials.'
          : `No registered ${role || 'user'} account found with this email.`,
      };
    }

    if (user.status === 'suspended') {
      return {
        success: false,
        error: 'Your account has been suspended by administration. Contact Omshankar.',
      };
    }

    if (password && user.password && user.password !== password.trim()) {
      return {
        success: false,
        error: 'Incorrect password entered. Please verify your credentials.',
      };
    }

    setCurrentUser(user);
    logActivity('User Signed In', user.name, user.role, `Logged in via: ${user.email}`);
    return { success: true };
  };

  const lookupStudentAccount = (query: string): { found: boolean; student?: User; enrolledBatches?: Batch[]; message?: string } => {
    const q = query.toLowerCase().trim();
    if (!q) return { found: false, message: 'Please enter your Student ID / Roll No or Registered Email.' };

    const student = users.find(
      (u) => u.role === 'student' && (u.email.toLowerCase() === q || (u.studentId && u.studentId.toLowerCase() === q))
    );

    if (!student) {
      return {
        found: false,
        message: 'No student account found. In Vision Portal, accounts are created by teachers first. Please ask your instructor to enroll you in their batch.',
      };
    }

    const studentEnrollments = enrollments.filter((e) => e.studentId === student.id && e.status === 'active');
    const myBatches = batches.filter((b) => studentEnrollments.some((e) => e.batchId === b.id));

    return {
      found: true,
      student,
      enrolledBatches: myBatches,
    };
  };

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      logActivity('Switched Account', user.name, user.role, `Switched persona to ${user.name}`);
    }
  };

  const logout = () => {
    if (currentUser) {
      logActivity('User Signed Out', currentUser.name, currentUser.role, 'Session terminated');
    }
    setCurrentUser(null);
  };

  const registerTeacher = (data: {
    name: string;
    email: string;
    password: string;
    verificationKey: string;
    subjects?: string[];
    classSubjectAssignments: { grade: GradeLevel; subject: string }[];
    phone?: string;
    bio?: string;
    upiId?: string;
    initialBatch?: {
      name: string;
      grade: GradeLevel;
      subject: string;
      monthlyFee: number;
      joiningMonth: string;
      feeDueDateDay?: number;
      schedule?: string;
      description?: string;
    };
  }) => {
    // Check password
    if (!data.password || data.password.trim().length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Specific security method: verify against authorized Institute Passkeys
    const cleanedKey = data.verificationKey.trim().toUpperCase();
    const isAuthorized = customPasskeys.some((pk) => pk.toUpperCase() === cleanedKey);

    if (!isAuthorized) {
      return {
        success: false,
        error: 'Invalid Institute Teacher Authorization Passkey. Please verify with Administrator Omshankar.',
      };
    }

    // Check duplicate email
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase().trim())) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const uniqueSubjects = Array.from(new Set(data.classSubjectAssignments.map((a) => a.subject)));
    const newTeacherId = `T-${100 + users.filter((u) => u.role === 'teacher').length + 1}`;

    const newTeacher: User = {
      id: `teacher-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password.trim(),
      role: 'teacher',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      phone: data.phone?.trim() || '+91 98000 00000',
      createdAt: new Date().toISOString(),
      teacherId: newTeacherId,
      teacherVerificationKey: cleanedKey,
      subjects: uniqueSubjects.length > 0 ? uniqueSubjects : (data.subjects || ['Mathematics']),
      classSubjectAssignments: data.classSubjectAssignments,
      bio: data.bio?.trim() || 'Faculty member at Vision Classes.',
      upiId: data.upiId?.trim() || 'visionclasses@upi',
    };

    setUsers((prev) => [...prev, newTeacher]);
    setCurrentUser(newTeacher);

    // If teacher decided initial batch fee and joining session month on account creation, create the batch
    if (data.initialBatch) {
      const initialBatch: Batch = {
        id: `batch-${Date.now()}`,
        name: data.initialBatch.name.trim() || `${data.initialBatch.grade} · ${data.initialBatch.subject}`,
        grade: data.initialBatch.grade,
        subject: data.initialBatch.subject,
        subjectsList: data.initialBatch.subject.split(/[,&/]+/).map((s: string) => s.trim()).filter(Boolean),
        joiningMonth: data.initialBatch.joiningMonth.trim() || 'October 2026',
        monthlyFee: Number(data.initialBatch.monthlyFee) || 2800,
        feeDueDateDay: data.initialBatch.feeDueDateDay || 5,
        schedule: data.initialBatch.schedule || 'Mon, Wed, Fri · 5:00 PM – 6:30 PM',
        teacherId: newTeacher.id,
        teacherName: newTeacher.name,
        code: `VC-${data.initialBatch.grade.replace('Class ', '')}-${data.initialBatch.subject.slice(0, 3).toUpperCase()}`,
        roomOrPlatform: 'Room 101 / Main Campus',
        description: data.initialBatch.description || `Batch created by ${newTeacher.name} with decided fee ₹${data.initialBatch.monthlyFee}/month and joining session ${data.initialBatch.joiningMonth}.`,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setBatches((prev) => [initialBatch, ...prev]);
    }

    logActivity(
      'Teacher Registered',
      newTeacher.name,
      'teacher',
      `Registered for ${data.classSubjectAssignments.map((a) => `${a.grade} (${a.subject})`).join(', ')}${data.initialBatch ? ` with batch "${data.initialBatch.name}" (Fee: ₹${data.initialBatch.monthlyFee}/mo, Joining: ${data.initialBatch.joiningMonth})` : ''}`
    );

    return { success: true };
  };

  const registerStudent = (data: {
    name: string;
    email: string;
    password: string;
    grade: GradeLevel;
    phone?: string;
    parentName?: string;
    parentPhone?: string;
  }) => {
    if (!data.password || data.password.trim().length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase().trim())) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const studentCount = users.filter((u) => u.role === 'student').length + 1;
    const newStudentId = `ST-2026-${studentCount < 10 ? '0' + studentCount : studentCount}`;

    const newStudent: User = {
      id: `student-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password.trim(),
      role: 'student',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      phone: data.phone?.trim() || '+91 90000 00000',
      createdAt: new Date().toISOString(),
      studentId: newStudentId,
      grade: data.grade,
      parentName: data.parentName?.trim() || 'Parent/Guardian',
      parentPhone: data.parentPhone?.trim() || '+91 90000 00001',
    };

    setUsers((prev) => [...prev, newStudent]);
    setCurrentUser(newStudent);

    logActivity('Student Registered', newStudent.name, 'student', `Registered in ${newStudent.grade}`);

    return { success: true, user: newStudent };
  };

  const teacherCreateStudentForBatch = (
    batchId: string,
    studentData: {
      name: string;
      email: string;
      studentId?: string;
      password?: string;
      phone?: string;
      parentName?: string;
      parentPhone?: string;
      monthlyFee?: number;
      joiningMonth?: string;
    }
  ): { success: boolean; user?: User; error?: string } => {
    if (!currentUser || currentUser.role !== 'teacher') {
      return { success: false, error: 'Only authorized teachers can create student accounts.' };
    }

    const targetBatch = batches.find((b) => b.id === batchId);
    if (!targetBatch) {
      return { success: false, error: 'Selected batch does not exist.' };
    }

    // Check duplicate email
    if (users.some((u) => u.email.toLowerCase() === studentData.email.toLowerCase().trim())) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const studentCount = users.filter((u) => u.role === 'student').length + 1;
    const fallbackId = `ST-${studentCount < 10 ? '0' + studentCount : studentCount}`;
    const assignedStudentId = studentData.studentId?.trim().toUpperCase() || fallbackId;
    const defaultPassword = studentData.password?.trim() || 'student123';

    const newStudent: User = {
      id: `student-${Date.now()}`,
      name: studentData.name.trim(),
      email: studentData.email.toLowerCase().trim(),
      password: defaultPassword,
      role: 'student',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentData.name)}`,
      phone: studentData.phone?.trim() || '+91 90000 00000',
      createdAt: new Date().toISOString(),
      studentId: assignedStudentId,
      grade: targetBatch.grade,
      parentName: studentData.parentName?.trim() || 'Parent / Guardian',
      parentPhone: studentData.parentPhone?.trim() || '+91 90000 00001',
    };

    setUsers((prev) => [...prev, newStudent]);

    // Immediately enroll into the batch
    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      studentId: newStudent.id,
      studentName: newStudent.name,
      batchId: targetBatch.id,
      batchName: targetBatch.name,
      teacherId: currentUser.id,
      enrolledAt: new Date().toISOString(),
      status: 'active',
    };
    setEnrollments((prev) => [...prev, newEnrollment]);

    // Create initial tuition fee record for the batch joining month or teacher-customized month & fee
    const feeMonth = studentData.joiningMonth || targetBatch.joiningMonth || 'October 2026';
    const feeAmount = studentData.monthlyFee !== undefined && !isNaN(Number(studentData.monthlyFee))
      ? Number(studentData.monthlyFee)
      : targetBatch.monthlyFee;

    const newFee: FeeRecord = {
      id: `fee-${Date.now()}`,
      studentId: newStudent.id,
      studentName: newStudent.name,
      batchId: targetBatch.id,
      batchName: targetBatch.name,
      teacherId: currentUser.id,
      month: feeMonth,
      amount: feeAmount,
      dueDate: '2026-10-15',
      status: 'pending',
      reminderCount: 0,
      createdAt: new Date().toISOString(),
    };
    setFeeRecords((prev) => [newFee, ...prev]);

    logActivity(
      'Student Account Created by Teacher',
      currentUser.name,
      'teacher',
      `Provisioned account for ${newStudent.name} (${newStudent.email}) enrolled in ${targetBatch.name} (Fee: ₹${feeAmount}, Joining: ${feeMonth})`
    );

    return { success: true, user: newStudent };
  };

  // Admin Management Actions
  const terminateUser = (userId: string) => {
    const userToTerminate = users.find((u) => u.id === userId);
    if (!userToTerminate) return;

    // Remove user
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    // Remove enrollments
    setEnrollments((prev) => prev.filter((e) => e.studentId !== userId && e.teacherId !== userId));

    logActivity(
      'User Terminated',
      'Administrator Omshankar',
      'admin',
      `Permanently terminated ${userToTerminate.role} account: ${userToTerminate.name} (${userToTerminate.email})`
    );

    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
          logActivity(
            `User ${newStatus === 'active' ? 'Activated' : 'Suspended'}`,
            'Administrator Omshankar',
            'admin',
            `Changed status of ${u.name} to ${newStatus}`
          );
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const adminAddUser = (data: Partial<User>) => {
    const newUser: User = {
      id: `${data.role || 'user'}-${Date.now()}`,
      name: data.name || 'New Member',
      email: data.email || `user${Date.now()}@visionclasses.edu`,
      password: data.password || 'demo1234',
      role: data.role || 'student',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name || 'Member')}`,
      phone: data.phone || '+91 98000 00000',
      createdAt: new Date().toISOString(),
      grade: data.grade,
      subjects: data.subjects,
      classSubjectAssignments: data.classSubjectAssignments,
      teacherId: data.role === 'teacher' ? `T-${100 + users.length}` : undefined,
      studentId: data.role === 'student' ? `ST-2026-${users.length}` : undefined,
    };

    setUsers((prev) => [newUser, ...prev]);
    logActivity('Admin Added User', 'Administrator Omshankar', 'admin', `Directly enrolled ${newUser.role} ${newUser.name}`);
  };

  const adminBroadcastNotice = (title: string, message: string) => {
    const newNotifs: AppNotification[] = users.map((u) => ({
      id: `notif-admin-${Date.now()}-${u.id}`,
      userId: u.id,
      title: `⚡ Admin Notice: ${title}`,
      message,
      type: 'message',
      linkTab: 'messages',
      read: false,
      createdAt: new Date().toISOString(),
    }));

    setNotifications((prev) => [...newNotifs, ...prev]);
    logActivity('Broadcast Notice Sent', 'Administrator Omshankar', 'admin', `Title: "${title}"`);
  };

  const addCustomPasskey = (key: string) => {
    const cleaned = key.trim().toUpperCase();
    if (!cleaned) return;
    if (!customPasskeys.includes(cleaned)) {
      setCustomPasskeys((prev) => [...prev, cleaned]);
      logActivity('Passkey Added', 'Administrator Omshankar', 'admin', `Authorized new teacher key: ${cleaned}`);
    }
  };

  const removeCustomPasskey = (key: string) => {
    setCustomPasskeys((prev) => prev.filter((k) => k !== key));
    logActivity('Passkey Revoked', 'Administrator Omshankar', 'admin', `Revoked teacher passkey: ${key}`);
  };

  // Batches
  const createBatch = (data: Omit<Batch, 'id' | 'teacherId' | 'teacherName' | 'createdAt' | 'active'>): Batch => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only verified teachers can create batches.');
    }

    const newBatch: Batch = {
      ...data,
      id: `batch-${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setBatches((prev) => [...prev, newBatch]);
    return newBatch;
  };

  const updateBatch = (batchId: string, updates: Partial<Batch>) => {
    setBatches((prev) => prev.map((b) => (b.id === batchId ? { ...b, ...updates } : b)));
  };

  const updateBatchFeeAndMonth = (batchId: string, monthlyFee: number, joiningMonth: string) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              monthlyFee: Number(monthlyFee) || b.monthlyFee,
              joiningMonth: joiningMonth?.trim() || b.joiningMonth,
            }
          : b
      )
    );
    logActivity('Batch Fee & Month Decided by Teacher', currentUser?.name || 'Teacher', 'teacher', `Updated batch ${batchId} to ₹${monthlyFee}/mo, Joining: ${joiningMonth}`);
  };

  // Student Direct Registration for a Teacher's Batch
  const registerStudentForBatch = (data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    grade?: GradeLevel;
    batchId: string;
    parentName?: string;
    parentPhone?: string;
  }): { success: boolean; user?: User; error?: string; message?: string } => {
    const targetBatch = batches.find((b) => b.id === data.batchId);
    if (!targetBatch) {
      return { success: false, error: 'Selected batch does not exist or is inactive.' };
    }

    if (!data.name?.trim() || !data.email?.trim()) {
      return { success: false, error: 'Full Name and Email are required for registration.' };
    }

    const emailQuery = data.email.toLowerCase().trim();
    let studentUser = users.find((u) => u.email.toLowerCase() === emailQuery);

    if (!studentUser) {
      const studentCount = users.filter((u) => u.role === 'student').length + 1;
      const assignedStudentId = `ST-2026-${studentCount < 10 ? '0' + studentCount : studentCount}`;
      const defaultPassword = data.password?.trim() || 'student123';

      studentUser = {
        id: `student-${Date.now()}`,
        name: data.name.trim(),
        email: emailQuery,
        password: defaultPassword,
        role: 'student',
        status: 'active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
        phone: data.phone?.trim() || '+91 90000 00000',
        createdAt: new Date().toISOString(),
        studentId: assignedStudentId,
        grade: data.grade || targetBatch.grade,
        parentName: data.parentName?.trim() || 'Parent / Guardian',
        parentPhone: data.parentPhone?.trim() || '+91 90000 00001',
      };

      setUsers((prev) => [...prev, studentUser!]);
    }

    // Check if already enrolled in this batch
    const isEnrolled = enrollments.some(
      (e) => e.studentId === studentUser!.id && e.batchId === targetBatch.id && e.status === 'active'
    );
    if (isEnrolled) {
      return {
        success: false,
        error: `You are already an enrolled member of ${targetBatch.name}. Please sign in to your dashboard.`,
      };
    }

    // Check if admission request already exists
    const existingReq = joinRequests.find(
      (r) => r.studentId === studentUser!.id && r.batchId === targetBatch.id && r.status === 'pending'
    );
    if (existingReq) {
      return {
        success: true,
        message: `Your registration for ${targetBatch.name} is already pending teacher verification! Fee: ₹${targetBatch.monthlyFee.toLocaleString()}/mo · Joining: ${targetBatch.joiningMonth || 'October 2026'}.`,
        user: studentUser,
      };
    }

    const newRequest: JoinRequest = {
      id: `req-${Date.now()}`,
      studentId: studentUser.id,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      studentPhone: studentUser.phone,
      grade: studentUser.grade || targetBatch.grade,
      batchId: targetBatch.id,
      batchCode: targetBatch.code,
      batchName: targetBatch.name,
      teacherId: targetBatch.teacherId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    setJoinRequests((prev) => [newRequest, ...prev]);

    // Send immediate notification to the batch's teacher
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: targetBatch.teacherId,
      title: `New Student Registration · ${targetBatch.name}`,
      message: `${studentUser.name} registered for ${targetBatch.name} (Decided Fee: ₹${targetBatch.monthlyFee.toLocaleString()}/mo, Joining: ${targetBatch.joiningMonth || 'October 2026'}). Review in Admissions.`,
      type: 'approval',
      linkTab: 'approvals',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    logActivity(
      'Student Registered for Batch',
      studentUser.name,
      'student',
      `Registered for ${targetBatch.name} (Teacher Decided Fee: ₹${targetBatch.monthlyFee}/mo, Joining: ${targetBatch.joiningMonth})`
    );

    return {
      success: true,
      message: `Registration successfully submitted for ${targetBatch.name}! Monthly Fee: ₹${targetBatch.monthlyFee.toLocaleString()}/month · Joining: ${targetBatch.joiningMonth || 'October 2026'}. Teacher ${targetBatch.teacherName} will review and activate your student access.`,
      user: studentUser,
    };
  };

  // Joining Class via Unique Code with Teacher Approval
  const requestJoinBatch = (batchCode: string, studentId: string) => {
    const student = users.find((u) => u.id === studentId);
    if (!student) return { success: false, message: 'Student account not found.' };

    const batch = batches.find((b) => b.code.toUpperCase().trim() === batchCode.toUpperCase().trim() && b.active);
    if (!batch) {
      return { success: false, message: `Invalid class code "${batchCode}". Please check with your instructor.` };
    }

    // Check if already enrolled
    const isEnrolled = enrollments.some((e) => e.studentId === studentId && e.batchId === batch.id && e.status === 'active');
    if (isEnrolled) {
      return { success: false, message: 'You are already an approved member of this batch.' };
    }

    // Check if pending request exists
    const existingReq = joinRequests.find((r) => r.studentId === studentId && r.batchId === batch.id && r.status === 'pending');
    if (existingReq) {
      return { success: false, message: 'Your join request for this batch is already pending teacher review.' };
    }

    const newRequest: JoinRequest = {
      id: `req-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      grade: student.grade || batch.grade,
      batchId: batch.id,
      batchCode: batch.code,
      batchName: batch.name,
      teacherId: batch.teacherId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    setJoinRequests((prev) => [newRequest, ...prev]);

    // Send notification to the specific teacher
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: batch.teacherId,
      title: 'New Student Admission Request',
      message: `${student.name} entered code ${batch.code} for ${batch.name} and is waiting for your approval.`,
      type: 'approval',
      linkTab: 'approvals',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return {
      success: true,
      message: `Join request sent to ${batch.teacherName}! Waiting for teacher approval.`,
      request: newRequest,
    };
  };

  const approveJoinRequest = (requestId: string) => {
    const request = joinRequests.find((r) => r.id === requestId);
    if (!request) return;

    const batch = batches.find((b) => b.id === request.batchId);
    if (!batch) return;

    // Update request
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved', reviewedAt: new Date().toISOString() } : r))
    );

    // Create Enrollment
    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      studentId: request.studentId,
      batchId: request.batchId,
      teacherId: request.teacherId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
    };
    setEnrollments((prev) => [...prev, newEnrollment]);

    // Create initial fee invoice with the batch's due date
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const dueDateFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(batch.feeDueDateDay).padStart(2, '0')}`;

    const newFee: FeeRecord = {
      id: `fee-${Date.now()}`,
      studentId: request.studentId,
      studentName: request.studentName,
      batchId: batch.id,
      batchName: batch.name,
      teacherId: batch.teacherId,
      month: monthName,
      amount: batch.monthlyFee,
      dueDate: dueDateFormatted,
      status: 'pending',
      reminderCount: 0,
    };
    setFeeRecords((prev) => [newFee, ...prev]);

    // Send student approval notification
    const studentNotif: AppNotification = {
      id: `notif-${Date.now()}-approved`,
      userId: request.studentId,
      title: 'Class Admission Approved! 🎉',
      message: `You have been admitted to ${batch.name} by ${batch.teacherName}. You can now view materials, assignments, and lectures.`,
      type: 'approval',
      linkTab: 'classes',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [studentNotif, ...prev]);

    // Send welcome direct message from teacher
    const welcomeMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: batch.teacherId,
      senderName: batch.teacherName,
      senderRole: 'teacher',
      receiverId: request.studentId,
      receiverName: request.studentName,
      content: `Welcome to ${batch.name}! Please explore our study notes and solve the active assignments. Feel free to message me anytime if you have any questions.`,
      timestamp: new Date().toISOString(),
      read: false,
      batchId: batch.id,
    };
    setMessages((prev) => [...prev, welcomeMsg]);
  };

  const rejectJoinRequest = (requestId: string, reason?: string) => {
    const request = joinRequests.find((r) => r.id === requestId);
    if (!request) return;

    setJoinRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString(), rejectionReason: reason || 'Not approved by instructor.' }
          : r
      )
    );

    const studentNotif: AppNotification = {
      id: `notif-${Date.now()}-rejected`,
      userId: request.studentId,
      title: 'Join Request Status Update',
      message: `Your request to join ${request.batchName} was not approved: ${reason || 'Capacity full or criteria mismatch.'}`,
      type: 'approval',
      linkTab: 'classes',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [studentNotif, ...prev]);
  };

  // Study Materials
  const uploadStudyMaterial = (material: Omit<StudyMaterial, 'id' | 'teacherId' | 'teacherName' | 'createdAt'>) => {
    if (!currentUser) return;
    const newMaterial: StudyMaterial = {
      ...material,
      id: `mat-${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setStudyMaterials((prev) => [newMaterial, ...prev]);
  };

  const deleteStudyMaterial = (materialId: string) => {
    setStudyMaterials((prev) => prev.filter((m) => m.id !== materialId));
  };

  // Homework
  const createHomework = (homework: Omit<Homework, 'id' | 'teacherId' | 'createdAt'>) => {
    if (!currentUser) return;
    const newHw: Homework = {
      ...homework,
      id: `hw-${Date.now()}`,
      teacherId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setHomeworks((prev) => [newHw, ...prev]);

    // Notify enrolled students
    const batchStudents = enrollments.filter((e) => e.batchId === homework.batchId && e.status === 'active');
    const newNotifs: AppNotification[] = batchStudents.map((e) => ({
      id: `notif-hw-${Date.now()}-${e.studentId}`,
      userId: e.studentId,
      title: 'New Homework Assigned',
      message: `${currentUser.name} assigned "${homework.title}" in ${homework.batchName}. Due: ${new Date(homework.dueDate).toLocaleDateString()}.`,
      type: 'homework',
      linkTab: 'homework',
      read: false,
      createdAt: new Date().toISOString(),
    }));
    setNotifications((prev) => [...newNotifs, ...prev]);
  };

  const submitHomework = (submission: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newSub: HomeworkSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };
    setHomeworkSubmissions((prev) => [newSub, ...prev]);
  };

  const gradeHomeworkSubmission = (submissionId: string, marksObtained: number, feedback: string) => {
    setHomeworkSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              marksObtained,
              feedback,
              status: 'graded',
              gradedAt: new Date().toISOString(),
            }
          : s
      )
    );

    const sub = homeworkSubmissions.find((s) => s.id === submissionId);
    if (sub) {
      const notif: AppNotification = {
        id: `notif-grade-${Date.now()}`,
        userId: sub.studentId,
        title: 'Homework Graded! 📝',
        message: `Your assignment submission was graded: ${marksObtained} marks. Feedback: "${feedback}"`,
        type: 'homework',
        linkTab: 'homework',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Attendance
  const markBatchAttendance = (records: { studentId: string; studentName: string; batchId: string; date: string; status: AttendanceStatus; remarks?: string }[]) => {
    if (!currentUser) return;
    setAttendanceRecords((prev) => {
      // Filter out existing records for this batch and date
      const dateSet = new Set(records.map((r) => `${r.batchId}_${r.date}_${r.studentId}`));
      const retained = prev.filter((r) => !dateSet.has(`${r.batchId}_${r.date}_${r.studentId}`));
      const newItems: AttendanceRecord[] = records.map((r) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentId: r.studentId,
        studentName: r.studentName,
        batchId: r.batchId,
        teacherId: currentUser.id,
        date: r.date,
        status: r.status,
        remarks: r.remarks,
      }));
      return [...newItems, ...retained];
    });
  };

  // Test Scores
  const addTestScore = (score: Omit<TestScore, 'id' | 'teacherId'>) => {
    if (!currentUser) return;
    const newScore: TestScore = {
      ...score,
      id: `test-${Date.now()}`,
      teacherId: currentUser.id,
    };
    setTestScores((prev) => [newScore, ...prev]);

    // Send student notification
    const notif: AppNotification = {
      id: `notif-test-${Date.now()}`,
      userId: score.studentId,
      title: 'New Test Results Published 📊',
      message: `Score published for "${score.testName}": ${score.marksObtained}/${score.maxMarks} (${score.gradeLetter || ''}). Check your performance dashboard.`,
      type: 'attendance',
      linkTab: 'performance',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Fees & Automated Reminders
  const setFeeDueDate = (feeRecordId: string, newDueDate: string) => {
    setFeeRecords((prev) =>
      prev.map((f) => (f.id === feeRecordId ? { ...f, dueDate: newDueDate } : f))
    );
  };

  const createMonthlyFeesForBatch = (batchId: string, month: string, dueDate: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const enrolledStudents = enrollments.filter((e) => e.batchId === batchId && e.status === 'active');
    const newRecords: FeeRecord[] = enrolledStudents.map((enr) => {
      const student = users.find((u) => u.id === enr.studentId);
      return {
        id: `fee-${Date.now()}-${enr.studentId}`,
        studentId: enr.studentId,
        studentName: student?.name || 'Student',
        batchId: batch.id,
        batchName: batch.name,
        teacherId: batch.teacherId,
        month,
        amount: batch.monthlyFee,
        dueDate,
        status: 'pending',
        reminderCount: 0,
      };
    });

    setFeeRecords((prev) => [...newRecords, ...prev]);
  };

  const sendFeeReminder = (feeRecordId: string): { success: boolean; message: string } => {
    const record = feeRecords.find((f) => f.id === feeRecordId);
    if (!record) return { success: false, message: 'Fee record not found' };

    setFeeRecords((prev) =>
      prev.map((f) =>
        f.id === feeRecordId
          ? {
              ...f,
              reminderCount: f.reminderCount + 1,
              reminderSentAt: new Date().toISOString(),
            }
          : f
      )
    );

    // Create student in-app notification
    const notif: AppNotification = {
      id: `notif-fee-${Date.now()}`,
      userId: record.studentId,
      title: 'Tuition Fee Payment Reminder 🔔',
      message: `Reminder for ${record.batchName} (${record.month}): Amount ₹${record.amount.toLocaleString()} is due by ${record.dueDate}. Please scan the interactive QR code to pay.`,
      type: 'fee_reminder',
      linkTab: 'fees',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    // Also send an automated direct message from teacher
    const msg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: record.teacherId,
      senderName: currentUser?.name || 'Instructor',
      senderRole: 'teacher',
      receiverId: record.studentId,
      receiverName: record.studentName,
      content: `Hello ${record.studentName}, this is a gentle reminder that your tuition fee of ₹${record.amount} for ${record.month} (${record.batchName}) has a due date of ${record.dueDate}. Please pay using the app's QR code. Thank you!`,
      timestamp: new Date().toISOString(),
      read: false,
      batchId: record.batchId,
    };
    setMessages((prev) => [...prev, msg]);

    return { success: true, message: `Payment reminder sent to ${record.studentName}!` };
  };

  const sendAutomatedBatchFeeReminders = (batchId: string): number => {
    const pendingInBatch = feeRecords.filter(
      (f) => f.batchId === batchId && (f.status === 'pending' || f.status === 'overdue')
    );

    pendingInBatch.forEach((rec) => {
      sendFeeReminder(rec.id);
    });

    return pendingInBatch.length;
  };

  const submitFeePayment = (
    feeId: string,
    transactionRef: string,
    paymentMethod: string,
    screenshotUrl?: string,
    screenshotHash?: string,
    paidTo?: string,
    paidBy?: string,
    paidTime?: string,
    aiAnalysis?: PaymentAiAnalysis
  ) => {
    const isProxy = aiAnalysis?.isProxy || false;

    setFeeRecords((prev) =>
      prev.map((f) =>
        f.id === feeId
          ? {
              ...f,
              status: 'verification_pending',
              transactionRef,
              paymentMethod,
              paidAt: new Date().toISOString(),
              screenshotUrl,
              screenshotHash,
              paidTo,
              paidBy,
              paidTime,
              isFlaggedAsProxy: isProxy,
              aiAnalysis,
            }
          : f
      )
    );

    const rec = feeRecords.find((f) => f.id === feeId);
    if (rec) {
      // Notify teacher with AI analysis status
      const notif: AppNotification = {
        id: `notif-pay-${Date.now()}`,
        userId: rec.teacherId,
        title: isProxy ? '🚨 Fraud Alert: Proxy Fee Detected!' : 'Tuition Fee Payment Received',
        message: isProxy
          ? `Algorithmic AI flagged fee submission by ${rec.studentName} as PROXY (${aiAnalysis?.proxyReason || 'Duplicate screenshot/UTR collision'}). Review immediately.`
          : `${rec.studentName} submitted payment for ${rec.month} (Ref: ${transactionRef}). Verified by Algorithmic AI.`,
        type: 'fee_reminder',
        linkTab: 'fees',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);

      logActivity(
        isProxy ? '🚨 Fee Proxy Detected' : 'Fee Payment Submitted',
        rec.studentName,
        'student',
        isProxy
          ? `Algorithmic AI flagged payment for ${rec.batchName} (${rec.month}) as PROXY: ${aiAnalysis?.proxyReason}`
          : `Submitted tuition fee for ${rec.month} (Ref: ${transactionRef}, AI Verdict: ${aiAnalysis?.verdict || 'VERIFIED'})`
      );
    }
  };

  const verifyFeePayment = (feeId: string, approved: boolean, reason?: string, markAsProxy?: boolean) => {
    setFeeRecords((prev) =>
      prev.map((f) =>
        f.id === feeId
          ? {
              ...f,
              status: approved ? 'paid' : 'pending',
              isFlaggedAsProxy: markAsProxy ? true : f.isFlaggedAsProxy,
              receiptUrl: approved ? `REC-VC-${Date.now().toString().slice(-6)}` : undefined,
            }
          : f
      )
    );

    const rec = feeRecords.find((f) => f.id === feeId);
    if (rec) {
      const notif: AppNotification = {
        id: `notif-fee-verified-${Date.now()}`,
        userId: rec.studentId,
        title: approved
          ? 'Fee Payment Verified! 🧾'
          : markAsProxy
          ? '🚨 Fee Submission Flagged as Proxy'
          : 'Fee Verification Alert',
        message: approved
          ? `Your tuition fee of ₹${rec.amount} for ${rec.month} has been verified and confirmed. Digital receipt is ready.`
          : markAsProxy
          ? `Your payment submission was rejected as PROXY (${reason || 'Duplicate receipt or collision detected'}). Please contact administration.`
          : reason || `Your payment reference was marked incomplete by your instructor. Please recheck with your teacher.`,
        type: 'fee_reminder',
        linkTab: 'fees',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);

      logActivity(
        approved ? 'Fee Payment Approved' : markAsProxy ? 'Fee Rejected as Proxy' : 'Fee Payment Rejected',
        currentUser?.name || 'Faculty',
        'teacher',
        `${approved ? 'Approved' : 'Rejected'} payment for student ${rec.studentName} (${rec.month}).`
      );
    }
  };

  // Messaging
  const sendMessage = (receiverId: string, content: string, batchId?: string) => {
    if (!currentUser || !content.trim()) return;
    const receiver = users.find((u) => u.id === receiverId);
    if (!receiver) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId,
      receiverName: receiver.name,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      batchId,
    };
    setMessages((prev) => [...prev, newMsg]);

    const notif: AppNotification = {
      id: `notif-msg-${Date.now()}`,
      userId: receiverId,
      title: `New message from ${currentUser.name}`,
      message: content.length > 60 ? content.slice(0, 57) + '...' : content,
      type: 'message',
      linkTab: 'messages',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
  };

  const postAnnouncement = (announcement: Omit<Announcement, 'id' | 'teacherId' | 'teacherName' | 'createdAt'>) => {
    if (!currentUser) return;
    const newAnn: Announcement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    // Send notifications to all students in batch
    const targetStudents =
      announcement.batchId === 'all'
        ? enrollments.filter((e) => e.teacherId === currentUser.id && e.status === 'active')
        : enrollments.filter((e) => e.batchId === announcement.batchId && e.status === 'active');

    const notifs: AppNotification[] = targetStudents.map((e) => ({
      id: `notif-ann-${Date.now()}-${e.studentId}`,
      userId: e.studentId,
      title: `📢 Announcement: ${announcement.title}`,
      message: announcement.content.length > 80 ? announcement.content.slice(0, 77) + '...' : announcement.content,
      type: 'message',
      linkTab: 'announcements',
      read: false,
      createdAt: new Date().toISOString(),
    }));
    setNotifications((prev) => [...notifs, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  // Timetable Handlers
  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id' | 'teacherId' | 'teacherName'>) => {
    if (!currentUser) return;
    const newSlot: TimetableSlot = {
      ...slot,
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
    };
    setTimetableSlots((prev) => [...prev, newSlot]);
  };

  const updateTimetableSlot = (slotId: string, updates: Partial<TimetableSlot>) => {
    setTimetableSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, ...updates } : s)));
  };

  const deleteTimetableSlot = (slotId: string) => {
    setTimetableSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setBatches(INITIAL_BATCHES);
    setEnrollments(INITIAL_ENROLLMENTS);
    setJoinRequests(INITIAL_JOIN_REQUESTS);
    setStudyMaterials(INITIAL_STUDY_MATERIALS);
    setHomeworks(INITIAL_HOMEWORKS);
    setHomeworkSubmissions(INITIAL_SUBMISSIONS);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setTestScores(INITIAL_TEST_SCORES);
    setFeeRecords(INITIAL_FEE_RECORDS);
    setMessages(INITIAL_MESSAGES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTimetableSlots(INITIAL_TIMETABLE_SLOTS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        batches,
        enrollments,
        joinRequests,
        studyMaterials,
        homeworks,
        homeworkSubmissions,
        attendanceRecords,
        testScores,
        feeRecords,
        messages,
        announcements,
        notifications,
        timetableSlots,
        activityLogs,
        customPasskeys,
        appLogo,
        updateAppLogo,
        resetAppLogo,
        deleteDummyAccountsAndPortalData,
        reloadSampleDemoData,
        login,
        lookupStudentAccount,
        switchUser,
        logout,
        registerTeacher,
        registerStudent,
        registerStudentForBatch,
        teacherCreateStudentForBatch,
        terminateUser,
        toggleUserStatus,
        adminAddUser,
        adminBroadcastNotice,
        addCustomPasskey,
        removeCustomPasskey,
        createBatch,
        updateBatch,
        updateBatchFeeAndMonth,
        requestJoinBatch,
        approveJoinRequest,
        rejectJoinRequest,
        uploadStudyMaterial,
        deleteStudyMaterial,
        createHomework,
        submitHomework,
        gradeHomeworkSubmission,
        markBatchAttendance,
        addTestScore,
        setFeeDueDate,
        createMonthlyFeesForBatch,
        sendFeeReminder,
        sendAutomatedBatchFeeReminders,
        submitFeePayment,
        verifyFeePayment,
        sendMessage,
        markMessageAsRead,
        postAnnouncement,
        markNotificationAsRead,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
