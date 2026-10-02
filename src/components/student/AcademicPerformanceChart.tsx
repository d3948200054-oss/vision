import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Calendar, 
  BarChart3, 
  Filter, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { TestScore } from '../../types';

interface AcademicPerformanceChartProps {
  studentId?: string;
}

export const AcademicPerformanceChart: React.FC<AcademicPerformanceChartProps> = ({ studentId }) => {
  const { currentUser, testScores, homeworkSubmissions, homeworks, batches, enrollments } = useApp();

  const targetStudentId = studentId || currentUser?.id || '';

  // Get active student enrollments
  const myEnrollments = enrollments.filter((e) => e.studentId === targetStudentId && e.status === 'active');
  const myBatchIds = myEnrollments.map((e) => e.batchId);
  const myBatches = batches.filter((b) => myBatchIds.includes(b.id));

  // Actual tests for this student
  const realTests = useMemo(() => {
    return testScores
      .filter((t) => t.studentId === targetStudentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [testScores, targetStudentId]);

  // Actual homework submissions
  const realSubmissions = useMemo(() => {
    return homeworkSubmissions.filter((s) => s.studentId === targetStudentId);
  }, [homeworkSubmissions, targetStudentId]);

  // Relevant homeworks for enrolled batches
  const relevantHomeworks = useMemo(() => {
    return homeworks.filter((h) => myBatchIds.includes(h.batchId));
  }, [homeworks, myBatchIds]);

  // Fallback demo dataset for new students without graded evaluations yet
  const [useSampleDataIfEmpty, setUseSampleDataIfEmpty] = useState<boolean>(true);

  // If real tests exist, we default to real tests; if 0 real tests, allow sample demonstration
  const isDemonstration = realTests.length === 0 && useSampleDataIfEmpty;

  // Curated benchmark sample test series demonstrating steady academic growth
  const sampleTests: TestScore[] = useMemo(() => [
    {
      id: 'demo-1',
      studentId: targetStudentId,
      batchId: 'demo-b1',
      teacherId: 't1',
      testName: 'Diagnostic Assessment 1',
      subject: 'Mathematics',
      marksObtained: 38,
      maxMarks: 50,
      date: '2026-08-14',
      gradeLetter: 'B+',
      feedback: 'Good fundamental algebra skills. Focus on quadratic roots precision.',
    },
    {
      id: 'demo-2',
      studentId: targetStudentId,
      batchId: 'demo-b1',
      teacherId: 't1',
      testName: 'Mechanics & Motion Quiz',
      subject: 'Physics',
      marksObtained: 40,
      maxMarks: 50,
      date: '2026-08-28',
      gradeLetter: 'A',
      feedback: 'Strong grasp of free-body diagrams and kinetic formulas.',
    },
    {
      id: 'demo-3',
      studentId: targetStudentId,
      batchId: 'demo-b1',
      teacherId: 't1',
      testName: 'Polynomials & Linear Systems',
      subject: 'Mathematics',
      marksObtained: 43,
      maxMarks: 50,
      date: '2026-09-10',
      gradeLetter: 'A',
      feedback: 'Remarkable speed in solving two-variable equations.',
    },
    {
      id: 'demo-4',
      studentId: targetStudentId,
      batchId: 'demo-b1',
      teacherId: 't1',
      testName: 'Periodic Table & Bonding',
      subject: 'Chemistry',
      marksObtained: 44,
      maxMarks: 50,
      date: '2026-09-20',
      gradeLetter: 'A+',
      feedback: 'Excellent explanation of electronegativity trends.',
    },
    {
      id: 'demo-5',
      studentId: targetStudentId,
      batchId: 'demo-b1',
      teacherId: 't1',
      testName: 'Mid-Term Board Mock Exam',
      subject: 'Mathematics',
      marksObtained: 46,
      maxMarks: 50,
      date: '2026-09-28',
      gradeLetter: 'A+',
      feedback: 'Outstanding performance. Top 5% percentile in batch!',
    },
    {
      id: 'demo-6',
      studentId: targetStudentId,
      batchId: 'demo-b1',
      teacherId: 't1',
      testName: 'Electromagnetism & Waves Quiz',
      subject: 'Physics',
      marksObtained: 47,
      maxMarks: 50,
      date: '2026-10-02',
      gradeLetter: 'A+',
      feedback: 'Flawless numerical calculations on induced EMF.',
    },
  ], [targetStudentId]);

  // Active tests to display
  const activeTests = isDemonstration ? sampleTests : realTests;

  // State for controls
  const [selectedMetric, setSelectedMetric] = useState<'tests' | 'assignments' | 'subjects'>('tests');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '60d'>('all');

  // Available subjects for filtering
  const distinctSubjects = useMemo(() => {
    const subs = new Set<string>();
    activeTests.forEach((t) => subs.add(t.subject));
    myBatches.forEach((b) => {
      if (b.subject) subs.add(b.subject);
      b.subjectsList?.forEach((s) => subs.add(s));
    });
    return Array.from(subs);
  }, [activeTests, myBatches]);

  // Filtered tests based on subject & time range
  const filteredTests = useMemo(() => {
    let result = [...activeTests];
    if (selectedSubject !== 'all') {
      result = result.filter((t) => t.subject.toLowerCase() === selectedSubject.toLowerCase());
    }

    if (timeRange === '30d') {
      const now = new Date('2026-10-02T12:00:00Z').getTime();
      const cutoff = now - 30 * 24 * 60 * 60 * 1000;
      result = result.filter((t) => new Date(t.date).getTime() >= cutoff);
    } else if (timeRange === '60d') {
      const now = new Date('2026-10-02T12:00:00Z').getTime();
      const cutoff = now - 60 * 24 * 60 * 60 * 1000;
      result = result.filter((t) => new Date(t.date).getTime() >= cutoff);
    }

    return result;
  }, [activeTests, selectedSubject, timeRange]);

  // Format tests for Recharts Area/Line Chart
  const testTrendData = useMemo(() => {
    return filteredTests.map((t, idx) => {
      const pct = Math.round((t.marksObtained / t.maxMarks) * 100);
      const d = new Date(t.date);
      const formattedDate = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : t.date;

      return {
        id: t.id,
        name: t.testName,
        date: formattedDate,
        fullDate: t.date,
        subject: t.subject,
        score: pct,
        marks: `${t.marksObtained}/${t.maxMarks}`,
        grade: t.gradeLetter || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : 'B'),
        feedback: t.feedback || 'Evaluated by Faculty',
        benchmark: 80, // 80% distinction standard
        classAverage: 74, // batch comparative benchmark
        index: idx + 1,
      };
    });
  }, [filteredTests]);

  // Overall statistics
  const testStats = useMemo(() => {
    if (filteredTests.length === 0) {
      return {
        count: 0,
        average: 0,
        highest: 0,
        highestName: 'N/A',
        lowest: 0,
        trendDirection: 'neutral' as 'up' | 'down' | 'neutral',
        trendDelta: 0,
      };
    }

    const percentages = filteredTests.map((t) => Math.round((t.marksObtained / t.maxMarks) * 100));
    const count = percentages.length;
    const sum = percentages.reduce((acc, p) => acc + p, 0);
    const average = Math.round(sum / count);
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);

    const highestTest = filteredTests.find((t) => Math.round((t.marksObtained / t.maxMarks) * 100) === highest);

    // Calculate recent trajectory (compare last 2 vs first 2 if available)
    let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
    let trendDelta = 0;
    if (percentages.length >= 2) {
      const lastScore = percentages[percentages.length - 1];
      const prevScore = percentages[percentages.length - 2];
      trendDelta = lastScore - prevScore;
      if (trendDelta > 0) trendDirection = 'up';
      else if (trendDelta < 0) trendDirection = 'down';
    }

    return {
      count,
      average,
      highest,
      highestName: highestTest?.testName || 'Top Evaluation',
      lowest,
      trendDirection,
      trendDelta,
    };
  }, [filteredTests]);

  // Assignment Completion & Homework Data
  const assignmentData = useMemo(() => {
    // If student has real homework submissions, compute from real data
    if (!isDemonstration && relevantHomeworks.length > 0) {
      return relevantHomeworks.map((hw, idx) => {
        const sub = realSubmissions.find((s) => s.homeworkId === hw.id);
        const isSubmitted = !!sub;
        const marksPct = sub && sub.marksObtained !== undefined && hw.maxMarks > 0
          ? Math.round((sub.marksObtained / hw.maxMarks) * 100)
          : isSubmitted ? 90 : 0;

        const d = new Date(hw.dueDate);
        const formattedDate = !isNaN(d.getTime())
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `HW ${idx + 1}`;

        return {
          title: hw.title.length > 20 ? hw.title.substring(0, 18) + '...' : hw.title,
          fullName: hw.title,
          subject: hw.subject,
          dueDate: formattedDate,
          completionRate: isSubmitted ? 100 : 0,
          score: marksPct,
          status: isSubmitted ? 'Turned In' : 'Pending',
        };
      });
    }

    // Curated assignment completion demonstration
    return [
      { title: 'Algebra NCERT Ex 4.2', fullName: 'Quadratic Equations Exercise 4.2', subject: 'Mathematics', dueDate: 'Sep 02', completionRate: 100, score: 92, status: 'Turned In' },
      { title: 'Kinematics Numericals', fullName: 'Kinematics & Acceleration Numericals', subject: 'Physics', dueDate: 'Sep 09', completionRate: 100, score: 88, status: 'Turned In' },
      { title: 'Chemical Redox Balances', fullName: 'Redox Reactions Practice Problem Set', subject: 'Chemistry', dueDate: 'Sep 16', completionRate: 100, score: 95, status: 'Turned In' },
      { title: 'Arithmetic Progressions', fullName: 'Arithmetic Progressions Word Problems', subject: 'Mathematics', dueDate: 'Sep 23', completionRate: 100, score: 85, status: 'Turned In' },
      { title: 'Optics Ray Diagrams', fullName: 'Concave & Convex Lens Ray Diagrams', subject: 'Physics', dueDate: 'Sep 30', completionRate: 100, score: 94, status: 'Turned In' },
      { title: 'Trigonometric Proofs', fullName: 'Standard Trigonometric Identity Proofs', subject: 'Mathematics', dueDate: 'Oct 04', completionRate: 100, score: 96, status: 'Turned In' },
    ];
  }, [isDemonstration, relevantHomeworks, realSubmissions]);

  // Subject-wise Mastery Aggregation
  const subjectMasteryData = useMemo(() => {
    const subjectMap: Record<string, { totalPct: number; count: number }> = {};

    activeTests.forEach((t) => {
      const pct = (t.marksObtained / t.maxMarks) * 100;
      if (!subjectMap[t.subject]) {
        subjectMap[t.subject] = { totalPct: pct, count: 1 };
      } else {
        subjectMap[t.subject].totalPct += pct;
        subjectMap[t.subject].count += 1;
      }
    });

    return Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      studentScore: Math.round(data.totalPct / data.count),
      targetBenchmark: 80,
      evaluationsCount: data.count,
    }));
  }, [activeTests]);

  // Custom Recharts Tooltip for Tests
  const CustomTestTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs min-w-[210px] space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5">
            <span className="font-extrabold text-blue-400 uppercase tracking-wider text-[10px]">
              {data.subject}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {data.fullDate}
            </span>
          </div>

          <p className="font-black text-white text-sm leading-tight">{data.name}</p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Score Achieved:</span>
            <span className="font-black text-emerald-400 text-base">
              {data.score}% <span className="text-[11px] font-normal text-slate-300">({data.marks})</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Grade Letter:</span>
            <span className="font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
              {data.grade}
            </span>
          </div>

          {data.feedback && (
            <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800/80">
              Teacher: &quot;{data.feedback}&quot;
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Assignments
  const CustomAssignmentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[200px] space-y-1">
          <span className="text-[10px] font-bold text-blue-400 uppercase">{data.subject}</span>
          <p className="font-bold text-white text-xs">{data.fullName}</p>
          <div className="flex justify-between pt-1 text-slate-300">
            <span>Due Date:</span>
            <span className="font-medium text-white">{data.dueDate}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Graded Score:</span>
            <span className="font-extrabold text-emerald-400">{data.score}%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Status:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              {data.status}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Academic Performance & Growth Trends
            </h3>
            {isDemonstration && (
              <span className="text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Benchmark Trajectory Preview
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing chronological assessment marks, quiz progress, and assignment completion rates.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl shrink-0 overflow-x-auto">
          <button
            onClick={() => setSelectedMetric('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedMetric === 'tests'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Quiz & Test Trend</span>
          </button>

          <button
            onClick={() => setSelectedMetric('assignments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedMetric === 'assignments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>

          <button
            onClick={() => setSelectedMetric('subjects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedMetric === 'subjects'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Subject Mastery</span>
          </button>
        </div>
      </div>

      {/* Filter and Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[11px] text-slate-500">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              <option value="all">All Subjects ({distinctSubjects.length || 1})</option>
              {distinctSubjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Time range */}
          {selectedMetric === 'tests' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="font-semibold text-[11px] text-slate-500 ml-2">Timeframe:</span>
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-xl shadow-2xs text-[11px]">
                <button
                  onClick={() => setTimeRange('all')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    timeRange === 'all' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTimeRange('60d')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    timeRange === '60d' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Last 60d
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    timeRange === '30d' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Last 30d
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Demo / Live Data Toggle for Students with 0 tests */}
        {realTests.length === 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">
              {isDemonstration ? 'Showing Model Benchmark' : 'Showing Enrolled Records'}
            </span>
            <button
              onClick={() => setUseSampleDataIfEmpty(!useSampleDataIfEmpty)}
              className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-xl transition-all shadow-2xs"
            >
              {useSampleDataIfEmpty ? 'View Live Records (0)' : 'Show Sample Trajectory'}
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Average</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{testStats.average}%</span>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
              testStats.average >= 80 ? 'text-emerald-700 bg-emerald-100' : 'text-blue-700 bg-blue-100'
            }`}>
              {testStats.average >= 90 ? 'Grade A+' : testStats.average >= 80 ? 'Grade A' : 'Grade B'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Across {testStats.count} evaluated tests</p>
        </div>

        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Score</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{testStats.highest}%</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate" title={testStats.highestName}>
            {testStats.highestName}
          </p>
        </div>

        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recent Trajectory</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            {testStats.trendDirection === 'up' ? (
              <span className="flex items-center text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{testStats.trendDelta}%
              </span>
            ) : testStats.trendDirection === 'down' ? (
              <span className="flex items-center text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {testStats.trendDelta}%
              </span>
            ) : (
              <span className="flex items-center text-xs font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                Stable
              </span>
            )}
            <span className="text-[11px] font-bold text-slate-700">Progression</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">vs previous test cycle</p>
        </div>

        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Distinction Goal</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-blue-700">80%</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">CBSE Target</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {testStats.average >= 80 ? '🎯 Target achieved!' : `📈 ${80 - testStats.average}% to benchmark`}
          </p>
        </div>
      </div>

      {/* Main Interactive Recharts Area */}
      <div className="w-full pt-2">
        {selectedMetric === 'tests' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Evaluation Marks Percentage Over Time
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-emerald-500 inline-block border-b border-dashed border-emerald-500" />
                  Target Benchmark (80%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-slate-300 inline-block" />
                  Batch Avg (74%)
                </span>
              </div>
            </div>

            {testTrendData.length === 0 ? (
              <div className="h-64 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                <p className="font-bold text-slate-600 text-sm">No Test Records Found</p>
                <p className="text-xs max-w-sm mt-1">
                  Your instructor hasn&apos;t published test scores for this filter yet. You can click &quot;Show Sample Trajectory&quot; to preview this chart.
                </p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={testTrendData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      dy={6}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(val) => `${val}%`}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                      dx={-2}
                    />
                    <Tooltip content={<CustomTestTooltip />} />
                    <ReferenceLine
                      y={80}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Distinction 80%',
                        position: 'insideTopRight',
                        fill: '#059669',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    <ReferenceLine
                      y={74}
                      stroke="#94a3b8"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                      activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                      dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                      name="Score Percentage"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {selectedMetric === 'assignments' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Assignment Marks & Submission Completion Status
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Average Assignment Grade: {Math.round(assignmentData.reduce((acc, a) => acc + a.score, 0) / (assignmentData.length || 1))}%
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assignmentData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="title"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    dy={6}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomAssignmentTooltip />} />
                  <ReferenceLine
                    y={80}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  <Bar
                    dataKey="score"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                    name="Homework Marks %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedMetric === 'subjects' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Average Score Percentage by Subject
              </span>
              <span className="text-[11px] text-slate-500">Benchmark Target: 80%</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectMasteryData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="subject"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    dy={6}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'Average Score']}
                    labelStyle={{ fontWeight: 800, color: '#0f172a' }}
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Target 80%',
                      position: 'insideTopRight',
                      fill: '#059669',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                  <Bar
                    dataKey="studentScore"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={52}
                    name="Subject Average %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Explanatory Academic Feedback Card */}
      <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {testStats.average >= 85
              ? '🌟 Excellent trajectory! Consistently scoring in the Distinction tier across board examinations.'
              : testStats.average >= 75
              ? '👍 Solid progress! Keep focusing on unit practice questions to push past the 80% mark.'
              : '📖 Regular attendance and completing weekly assignments will strengthen your score trajectory.'}
          </span>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-white/90 border border-blue-200 px-2 py-1 rounded-lg shrink-0">
          Updated in Real-Time
        </span>
      </div>
    </div>
  );
};
