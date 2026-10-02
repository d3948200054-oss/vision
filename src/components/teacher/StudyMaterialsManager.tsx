import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyMaterial, GradeLevel } from '../../types';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Trash2, 
  ExternalLink, 
  Download, 
  Video, 
  Tag,
  Search,
  CheckCircle2
} from 'lucide-react';

export const StudyMaterialsManager: React.FC = () => {
  const { currentUser, batches, studyMaterials, uploadStudyMaterial, deleteStudyMaterial } = useApp();

  const myBatches = batches.filter((b) => b.teacherId === currentUser?.id);
  const myBatchIds = myBatches.map((b) => b.id);

  const teacherMaterials = studyMaterials.filter((m) => myBatchIds.includes(m.batchId));

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [mTitle, setMTitle] = useState('');
  const [mBatchId, setMBatchId] = useState(myBatches[0]?.id || '');
  const [mChapter, setMChapter] = useState('');
  const [mFileType, setMFileType] = useState<'pdf' | 'doc' | 'video' | 'notes'>('pdf');
  const [mFileUrl, setMFileUrl] = useState('');
  const [mFileSize, setMFileSize] = useState('3.5 MB');
  const [mDescription, setMDescription] = useState('');

  const filteredMaterials = teacherMaterials.filter((m) => {
    if (selectedBatchId !== 'all' && m.batchId !== selectedBatchId) return false;
    if (
      searchTerm &&
      !m.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !m.chapter?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === mBatchId);
    if (!batch) return;

    uploadStudyMaterial({
      title: mTitle.trim(),
      description: mDescription.trim(),
      batchId: batch.id,
      grade: batch.grade,
      subject: batch.subject,
      fileType: mFileType,
      fileUrl: mFileUrl.trim() || `https://visionclasses.edu/materials/${encodeURIComponent(mTitle)}.pdf`,
      fileSize: mFileSize,
      chapter: mChapter.trim(),
    });

    setShowUploadModal(false);
    setMTitle('');
    setMDescription('');
    setSuccessMsg('Study material published to class repository!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Study Materials & Revision Notes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload chapter notes, formula sheets, sample question banks, and video lecture recordings for grades 5–12.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Upload New Material
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notes by title or chapter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Class Batch:</span>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium"
          >
            <option value="all">All Batches</option>
            {myBatches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400">
          No study materials uploaded for this selection yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((mat) => {
            const batch = batches.find((b) => b.id === mat.batchId);

            return (
              <div
                key={mat.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {mat.grade} · {mat.subject}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {mat.fileSize || 'PDF'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{mat.title}</h3>
                  {mat.chapter && (
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                      {mat.chapter}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{mat.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    Uploaded: {new Date(mat.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                    <button
                      onClick={() => deleteStudyMaterial(mat.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Upload Study Material</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Batch *</label>
                <select
                  value={mBatchId}
                  onChange={(e) => setMBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  {myBatches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.grade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quadratic Equations Formula Sheet & Mind Map"
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chapter / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 4: Quadratic Equations"
                    value={mChapter}
                    onChange={(e) => setMChapter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">File Type</label>
                  <select
                    value={mFileType}
                    onChange={(e) => setMFileType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="pdf">PDF Document / Notes</option>
                    <option value="notes">Handwritten Formula Sheet</option>
                    <option value="doc">Word / Practice Sheet</option>
                    <option value="video">Recorded Video Lecture</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File Document URL / Cloud Drive Link
                </label>
                <input
                  type="url"
                  placeholder="https://visionclasses.edu/notes/algebra-unit4.pdf"
                  value={mFileUrl}
                  onChange={(e) => setMFileUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Topic Notes</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of key equations, high weightage exam tips, or derivation formulas..."
                  value={mDescription}
                  onChange={(e) => setMDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Publish to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
