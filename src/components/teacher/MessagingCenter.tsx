import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { User, DirectMessage } from '../../types';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User as UserIcon, 
  Radio, 
  Sparkles, 
  Check, 
  CheckCheck,
  Plus,
  GraduationCap
} from 'lucide-react';

interface MessagingCenterProps {
  initialRecipientId?: string | null;
  onSelectStudentDetail?: (student: User) => void;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  initialRecipientId,
  onSelectStudentDetail,
}) => {
  const {
    currentUser,
    users,
    batches,
    enrollments,
    messages,
    announcements,
    sendMessage,
    postAnnouncement,
  } = useApp();

  const [activeMode, setActiveMode] = useState<'direct' | 'announcements'>('direct');

  // Batches taught by CURRENT TEACHER
  const myBatches = batches.filter((b) => b.teacherId === currentUser?.id);
  const myBatchIds = myBatches.map((b) => b.id);

  // Enrolled students under this teacher
  const myEnrollments = enrollments.filter(
    (e) => myBatchIds.includes(e.batchId) && e.status === 'active'
  );
  const studentIds = Array.from(new Set(myEnrollments.map((e) => e.studentId)));
  const connectedStudents = users.filter((u) => studentIds.includes(u.id));

  // Active recipient
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialRecipientId || connectedStudents[0]?.id || ''
  );
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Announcement state
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annBatchId, setAnnBatchId] = useState('all');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRecipientId) {
      setSelectedStudentId(initialRecipientId);
    }
  }, [initialRecipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedStudentId]);

  const selectedStudent = users.find((u) => u.id === selectedStudentId);

  // 1-on-1 messages between currentUser and selectedStudent
  const conversation = messages.filter(
    (m) =>
      (m.senderId === currentUser?.id && m.receiverId === selectedStudentId) ||
      (m.senderId === selectedStudentId && m.receiverId === currentUser?.id)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedStudentId) return;

    sendMessage(selectedStudentId, messageText.trim());
    setMessageText('');
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === annBatchId);

    postAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      batchId: annBatchId,
      batchName: batch?.name || 'All Your Enrolled Classes',
      priority: annPriority,
    });

    setShowAnnounceModal(false);
    setAnnTitle('');
    setAnnContent('');
  };

  const filteredStudents = connectedStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Personal Messaging & Class Broadcasts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Message any enrolled student personally with guidance, or dispatch broadcast announcements to your batches.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveMode('direct')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeMode === 'direct'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            1-on-1 Direct Chat
          </button>
          <button
            onClick={() => setActiveMode('announcements')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeMode === 'announcements'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Broadcast Bulletins
          </button>
        </div>
      </div>

      {activeMode === 'direct' ? (
        /* 1-on-1 MESSAGING LAYOUT */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Left Column: Student Contacts */}
          <div className="border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
            <div className="p-3.5 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No connected students found.
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = student.id === selectedStudentId;
                  // Last message in conversation
                  const lastMsg = messages
                    .filter(
                      (m) =>
                        (m.senderId === currentUser?.id && m.receiverId === student.id) ||
                        (m.senderId === student.id && m.receiverId === currentUser?.id)
                    )
                    .pop();

                  return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/80 border-r-2 border-indigo-600 font-semibold'
                          : 'hover:bg-slate-100/70 bg-white'
                      }`}
                    >
                      <img
                        src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                        alt={student.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{student.name}</p>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lastMsg ? lastMsg.content : `${student.grade || 'Student'}`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className="md:col-span-2 flex flex-col h-full bg-white">
            {selectedStudent ? (
              <>
                {/* Chat Top Bar */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStudent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`}
                      alt={selectedStudent.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{selectedStudent.name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {selectedStudent.grade || 'Student'} · Direct Academic Channel
                      </p>
                    </div>
                  </div>

                  {onSelectStudentDetail && (
                    <button
                      onClick={() => onSelectStudentDetail(selectedStudent)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
                    >
                      View Student Dashboard
                    </button>
                  )}
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20">
                  {conversation.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>Start a conversation with {selectedStudent.name}.</p>
                      <p className="text-[11px]">Send study suggestions, feedback, or test tips.</p>
                    </div>
                  ) : (
                    conversation.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                            }`}
                          >
                            <p>{msg.content}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Message ${selectedStudent.name} personally...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors shrink-0"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Select a student from the left roster to begin messaging.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ANNOUNCEMENTS LAYOUT */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Published Batch Bulletins & Notices
            </h3>
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              New Broadcast
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 bg-white rounded-2xl border shadow-xs space-y-2 ${
                  ann.priority === 'urgent'
                    ? 'border-rose-300 ring-1 ring-rose-300/30'
                    : ann.priority === 'high'
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {ann.batchName}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      ann.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : ann.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ann.priority}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Broadcast Announcement</h3>
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePostAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Batch</label>
                <select
                  value={annBatchId}
                  onChange={(e) => setAnnBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="all">All My Enrolled Classes</option>
                  {myBatches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extra Sunday Class for Quadratic Equations"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="normal">Normal Information</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Body</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write clear details for your students..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
