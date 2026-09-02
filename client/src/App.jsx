import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatCards } from './components/StatCards';
import { StudentTable } from './components/StudentTable';
import { StudentModal } from './components/StudentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';
import { studentAPI, excelAPI, settingAPI } from './services/api';

export function App() {
  // Persistent Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shree_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [standardFilter, setStandardFilter] = useState('all');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Custom Confirm & Toast States
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    studentId: null,
    studentName: '',
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    } else {
      loadSettingsOnly();
    }
  }, [currentUser]);

  const loadSettingsOnly = async () => {
    try {
      const settingsRes = await settingAPI.get();
      if (settingsRes.data?.success) setSettings(settingsRes.data.data);
    } catch (_) {}
  };

  const loadAllData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [studentsRes, statsRes, settingsRes] = await Promise.all([
        studentAPI.getAll({
          search: searchTerm,
          status: statusFilter,
          standard: standardFilter,
          section: currentUser.section || 'all',
        }),
        studentAPI.getStats({ section: currentUser.section || 'all' }),
        settingAPI.get(),
      ]);

      if (studentsRes.data?.success) setStudents(studentsRes.data.data);
      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (settingsRes.data?.success) setSettings(settingsRes.data.data);
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadStudents();
    }
  }, [searchTerm, statusFilter, standardFilter]);

  const loadStudents = async () => {
    if (!currentUser) return;
    try {
      const res = await studentAPI.getAll({
        search: searchTerm,
        status: statusFilter,
        standard: standardFilter,
        section: currentUser.section || 'all',
      });
      if (res.data?.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleLoginSuccess = (user, token) => {
    localStorage.setItem('shree_auth_user', JSON.stringify(user));
    if (token) localStorage.setItem('shree_auth_token', token);
    setCurrentUser(user);
    setToast({
      title: `Welcome, ${user.name}!`,
      message: `Signed in as ${user.title}`,
      type: 'success',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('shree_auth_user');
    localStorage.removeItem('shree_auth_token');
    setCurrentUser(null);
    setStudents([]);
    setStats(null);
    setToast({
      title: 'Logged Out',
      message: 'You have been signed out successfully.',
      type: 'info',
    });
  };

  const handleSaveStudent = async (studentData) => {
    try {
      if (studentData.id) {
        await studentAPI.update(studentData.id, studentData);
        setToast({
          title: 'Student Updated',
          message: `Record for ${studentData.studentName} updated and synced to database!`,
          type: 'success',
        });
      } else {
        await studentAPI.create(studentData);
        setToast({
          title: 'Admission Saved',
          message: `New admission for ${studentData.studentName} saved and synced to database!`,
          type: 'success',
        });
      }
      setIsStudentModalOpen(false);
      setSelectedStudent(null);
      loadAllData();
    } catch (err) {
      setToast({
        title: 'Save Error',
        message: err.response?.data?.message || 'Failed to save student record.',
        type: 'error',
      });
    }
  };

  const promptDeleteStudent = (student) => {
    const sId = typeof student === 'object' ? student.id : student;
    const sName = typeof student === 'object' ? student.studentName : '';
    setConfirmDialog({
      isOpen: true,
      studentId: sId,
      studentName: sName,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.studentId) return;
    try {
      await studentAPI.delete(confirmDialog.studentId);
      setToast({
        title: 'Record Deleted',
        message: 'Student record permanently removed from ledger and database.',
        type: 'success',
      });
      setConfirmDialog({ isOpen: false, studentId: null, studentName: '' });
      loadAllData();
    } catch (err) {
      setToast({
        title: 'Delete Error',
        message: 'Failed to delete student record.',
        type: 'error',
      });
    }
  };

  const handleSaveSettings = async (settingsData) => {
    try {
      const res = await settingAPI.update(settingsData);
      if (res.data?.success) {
        setSettings(res.data.data);
        setToast({
          title: 'Settings Saved',
          message: 'Institute profile and receipt terms updated successfully!',
          type: 'success',
        });
      }
    } catch (err) {
      setToast({
        title: 'Settings Error',
        message: 'Failed to update institute settings.',
        type: 'error',
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await excelAPI.exportStudents({
        status: statusFilter,
        standard: standardFilter,
        section: currentUser?.section || 'all',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Shree_Sai_Fee_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({
        title: 'Export Complete',
        message: 'Excel ledger downloaded successfully.',
        type: 'success',
      });
    } catch (err) {
      setToast({
        title: 'Export Error',
        message: 'Failed to export ledger to Excel.',
        type: 'error',
      });
    }
  };

  // If not authenticated, render Login Screen
  if (!currentUser) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <LoginScreen onLoginSuccess={handleLoginSuccess} settings={settings} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Navbar */}
      <Navbar
        settings={settings}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNewStudent={() => {
          setSelectedStudent(null);
          setIsStudentModalOpen(true);
        }}
        onImportExcel={() => setIsExcelModalOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 flex-1 w-full">
        {/* Executive Metric Cards */}
        <StatCards stats={stats} />

        {/* Student Ledger Roster & Search Table */}
        <StudentTable
          students={students}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          standardFilter={standardFilter}
          onStandardFilterChange={setStandardFilter}
          currentUser={currentUser}
          onViewReceipt={(student) => {
            setSelectedStudent(student);
            setIsReceiptModalOpen(true);
          }}
          onEditStudent={(student) => {
            setSelectedStudent(student);
            setIsStudentModalOpen(true);
          }}
          onDeleteStudent={(idOrStudent) => {
            const studentObj = students.find((s) => s.id === (idOrStudent?.id || idOrStudent));
            promptDeleteStudent(studentObj || idOrStudent);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-medium px-4">
        <p>© {new Date().getFullYear()} {settings?.instituteName || 'Shree Sai Classes'}. All rights reserved.</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Logged in as <strong>{currentUser.name}</strong> ({currentUser.title})
        </p>
      </footer>

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title="Delete Student Record?"
        studentName={confirmDialog.studentName}
        message="Are you sure you want to permanently delete this student record? This action will remove the record from both your ledger and the cloud database."
        confirmText="Delete Record"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmDialog({ isOpen: false, studentId: null, studentName: '' })}
      />

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setSelectedStudent(null);
        }}
        onSave={handleSaveStudent}
        student={selectedStudent}
        currentUser={currentUser}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        settings={settings}
      />

      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportSuccess={() => {
          loadAllData();
          setToast({
            title: 'Import Successful',
            message: 'Students imported and synced to database!',
            type: 'success',
          });
        }}
      />

      {currentUser?.role === 'admin' && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onSaveSettings={handleSaveSettings}
        />
      )}
    </div>
  );
}

export default App;
