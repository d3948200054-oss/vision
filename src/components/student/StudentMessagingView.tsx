import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DirectMessage, User } from '../../types';
import { 
  MessageSquare, 
  Send, 
  User as UserIcon, 
  Radio, 
  Sparkles, 
  Clock 
} from 'lucide-react';

export const StudentMessagingView: React.FC = () => {
  const {
    currentUser,
    users,
    batches,
    enrollments,
    messages,
    announcements,
    sendMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'direct' | 'announcements'>('direct');

  if (!currentUser) return null;

  // Active batches
  const myEnrollments = enrollments.filter((e) => e.studentId === currentUser.id && e.status === 'active');
  const myBatchIds = myEnrollments.map((e) => e.batchId);
  const myBatches = batches.filter((b) => myBatchIds.includes(b.id));

  // Teachers of these batches
  const teacherIds = Array.from(new Set(myBatches.map((b) => b.teacherId)));
  const myTeachers = users.filter((u) => teacherIds.includes(u.id));

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(myTeachers[0]?.id || '');
  const [messageText, setMessageText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTeacher = users.find((u) => u.id === selectedTeacherId);

  // 1-on-1 conversation
  const conversation = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.receiverId === selectedTeacherId) ||
      (m.senderId === selectedTeacherId && m.receiverId === currentUser.id)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedTeacherId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedTeacherId) return;

    sendMessage(selectedTeacherId, messageText.trim());
    setMessageText('');
  };

  // Filter announcements for batches student is enrolled in
  const myAnnouncements = announcements.filter(
    (a) => a.batchId === 'all' || myBatchIds.includes(a.batchId)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Direct Instructor Messaging & Announcements
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Chat 1-on-1 with your instructors for doubt solving, study guidance, and read institute announcements.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'direct'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            1-on-1 Teacher Chat
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'announcements'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Class Notices ({myAnnouncements.length})
          </button>
        </div>
      </div>

      {activeTab === 'direct' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[580px]">
          {/* Left Column: Teacher List */}
          <div className="border-r border-slate-200 bg-slate-50/50 p-3 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Your Instructors
            </p>

            {myTeachers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Join a class first to message your instructors.
              </div>
            ) : (
              myTeachers.map((teacher) => {
                const isSelected = teacher.id === selectedTeacherId;
                const lastMsg = messages
                  .filter(
                    (m) =>
                      (m.senderId === currentUser.id && m.receiverId === teacher.id) ||
                      (m.senderId === teacher.id && m.receiverId === currentUser.id)
                  )
                  .pop();

                return (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200 shadow-2xs font-semibold'
                        : 'bg-white hover:bg-slate-100/70 border border-slate-200'
                    }`}
                  >
                    <img
                      src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`}
                      alt={teacher.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{teacher.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {teacher.subjects?.join(', ')}
                      </p>
                      {lastMsg && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {lastMsg.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Chat Thread */}
          <div className="md:col-span-2 flex flex-col h-full bg-white">
            {selectedTeacher ? (
              <>
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
                  <img
                    src={selectedTeacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTeacher.name}`}
                    alt={selectedTeacher.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedTeacher.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      Faculty Member · {selectedTeacher.subjects?.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Conversation area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20">
                  {conversation.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400 space-y-1">
                      <p>No messages yet with {selectedTeacher.name}.</p>
                      <p>Send a question about homework, syllabus, or doubt clearing.</p>
                    </div>
                  ) : (
                    conversation.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;

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

                <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Ask ${selectedTeacher.name} a question...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors shrink-0"
                    title="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Select an instructor from the left to start messaging.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ANNOUNCEMENTS */
        <div className="space-y-3">
          {myAnnouncements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400">
              No class announcements posted at this time.
            </div>
          ) : (
            myAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {ann.batchName}
                    </span>
                    <span className="text-xs text-slate-500">By {ann.teacherName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
