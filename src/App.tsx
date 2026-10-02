import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { MobileAppBottomBar } from './components/common/MobileAppBottomBar';
import { AuthModal } from './components/auth/AuthModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { OmshankarProfileModal } from './components/admin/OmshankarProfileModal';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { InstallAppModal } from './components/common/InstallAppModal';
import { InitialBatchShowcase } from './components/common/InitialBatchShowcase';
import { Batch } from './types';

const MainContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('batches');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showOmshankarProfileModal, setShowOmshankarProfileModal] = useState<boolean>(false);
  const [showAdminPanelModal, setShowAdminPanelModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<'teacher' | 'student'>('teacher');
  const [selectedBatchForStudent, setSelectedBatchForStudent] = useState<Batch | null>(null);

  const openAuthWithRole = (role: 'teacher' | 'student', batchId?: string) => {
    setAuthDefaultRole(role);
    if (batchId) {
      const found = batches.find((b) => b.id === batchId);
      setSelectedBatchForStudent(found || null);
    } else {
      setSelectedBatchForStudent(null);
    }
    setShowAuthModal(true);
  };

  const handleSelectBatch = (batch: Batch) => {
    setSelectedBatchForStudent(batch);
    setAuthDefaultRole('student');
    setShowAuthModal(true);
  };

  const { batches } = useApp();

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={(role) => openAuthWithRole(role || 'teacher')}
        onOpenOmshankarProfile={() => setShowOmshankarProfileModal(true)}
        onOpenAdminPanel={() => setShowAdminPanelModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {currentUser ? (
          currentUser.role === 'teacher' ? (
            <TeacherDashboard
              currentTab={activeTab}
              setCurrentTab={setActiveTab}
            />
          ) : (
            <StudentDashboard
              currentTab={activeTab === 'batches' ? 'classes' : activeTab}
              setCurrentTab={setActiveTab}
            />
          )
        ) : (
          /* INITIAL VIEW: Shows available batches with Class, Subject/Subjects, Joining Month created by Teacher */
          <InitialBatchShowcase
            onSelectBatchForStudent={handleSelectBatch}
            onOpenTeacherAuth={() => openAuthWithRole('teacher')}
            onOpenStudentAuth={() => openAuthWithRole('student')}
            onOpenOmshankarProfile={() => setShowOmshankarProfileModal(true)}
            onOpenInstallModal={() => setShowInstallModal(true)}
          />
        )}
      </main>

      {/* Mobile Bottom App Bar */}
      <MobileAppBottomBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => openAuthWithRole('student')}
      />

      {/* Auth Modal (Supports Teacher Registration First & Student Batch Enrollment) */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setSelectedBatchForStudent(null);
          }}
          defaultRole={authDefaultRole}
          preselectedBatchId={selectedBatchForStudent?.id}
        />
      )}

      {/* Omshankar Profile Modal */}
      {showOmshankarProfileModal && (
        <OmshankarProfileModal
          isOpen={showOmshankarProfileModal}
          onClose={() => setShowOmshankarProfileModal(false)}
          onOpenAdminPanel={() => {
            setShowOmshankarProfileModal(false);
            setShowAdminPanelModal(true);
          }}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminPanelModal && (
        <AdminPanel
          isOpen={showAdminPanelModal}
          onClose={() => setShowAdminPanelModal(false)}
        />
      )}

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
