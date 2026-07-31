import React, { useState, useEffect } from 'react';
import { School, User } from '../types';
import { Building2, UserPlus, KeyRound, Shield, Check, Plus, Lock } from 'lucide-react';
import { fetchUsers as fetchUsersFirestore, createSchoolInFirestore } from '../services/firestoreService';

interface UserManagementViewProps {
  schools: School[];
  authToken: string | null;
  isAdmin: boolean;
  onRefreshSchools: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  schools,
  authToken,
  isAdmin,
  onRefreshSchools,
}) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [showAddSchoolModal, setShowAddSchoolModal] = useState<boolean>(false);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);

  // Add School Form
  const [schoolName, setSchoolName] = useState<string>('');
  const [commuteTime, setCommuteTime] = useState<number>(30);
  const [hasDedicatedStaff, setHasDedicatedStaff] = useState<boolean>(true);

  // Add User Form
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('password123');
  const [userRole, setUserRole] = useState<'entry' | 'admin'>('entry');
  const [userSchoolId, setUserSchoolId] = useState<string>(schools[0]?.id || '');

  // Reset Password Form
  const [newPassword, setNewPassword] = useState<string>('password123');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('API users fetch failed, fallback to Firestore:', err);
    }

    try {
      const usersData = await fetchUsersFirestore();
      setUsersList(usersData);
    } catch (fsErr) {
      console.error('Firestore users fetch failed:', fsErr);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName) return;

    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: schoolName,
          commuteTime,
          activeLabDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          hasDedicatedStaff,
        }),
      });

      if (res.ok) {
        setShowAddSchoolModal(false);
        setSchoolName('');
        onRefreshSchools();
        return;
      }
    } catch (err) {
      console.warn('API add school failed, saving to Firestore:', err);
    }

    try {
      await createSchoolInFirestore({
        name: schoolName,
        commuteTime,
        activeLabDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        hasDedicatedStaff,
      });
      setShowAddSchoolModal(false);
      setSchoolName('');
      onRefreshSchools();
    } catch (fsErr) {
      console.error('Firestore add school failed:', fsErr);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !userPassword) return;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
          schoolId: userRole === 'entry' ? userSchoolId : null,
        }),
      });

      if (res.ok) {
        setShowAddUserModal(false);
        setUserName('');
        setUserEmail('');
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add user.');
      }
    } catch (err) {
      console.error('Error adding user', err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset || !newPassword) return;

    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId: selectedUserForReset.id,
          newPassword,
        }),
      });

      if (res.ok) {
        setShowResetPasswordModal(false);
        alert(`Password for ${selectedUserForReset.name} reset successfully!`);
      } else {
        alert('Failed to reset password.');
      }
    } catch (err) {
      console.error('Error resetting password', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-6 shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-mono font-extrabold text-[#1A1A1A] uppercase flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#1D4ED8]" />
            ADMIN MANAGEMENT (SCHOOLS & USERS)
          </h2>
          <p className="text-xs text-gray-600 font-mono mt-1">
            Provision partner schools, assign lab coordinators, and reset passwords
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddSchoolModal(true)}
              className="bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] px-3 py-2 rounded text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-gray-100 flex items-center gap-1"
            >
              <Building2 className="w-4 h-4" /> + Add School
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-[#1D4ED8] text-white border-2 border-[#1A1A1A] px-3 py-2 rounded text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-blue-800 flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" /> + Add User
            </button>
          </div>
        )}
      </div>

      {/* SECTION 1: SCHOOLS LIST TABLE */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-5 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <h3 className="text-sm font-mono font-bold text-[#1A1A1A] uppercase tracking-wider mb-3">
          REGISTERED SCHOOLS ({schools.length})
        </h3>

        <div className="overflow-x-auto border-2 border-[#1A1A1A] rounded">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1A1A1A] text-white">
              <tr>
                <th className="p-2.5">SCHOOL NAME</th>
                <th className="p-2.5">COMMUTE TIME</th>
                <th className="p-2.5">ACTIVE DAYS</th>
                <th className="p-2.5">DEDICATED STAFF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schools.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2.5 font-bold text-[#1A1A1A]">{s.name}</td>
                  <td className="p-2.5">{s.commuteTime} minutes from HQ</td>
                  <td className="p-2.5 font-semibold text-gray-700">Mon, Tue, Wed, Thu, Fri</td>
                  <td className="p-2.5">
                    {s.hasDedicatedStaff ? (
                      <span className="bg-[#DCFCE7] text-[#166534] border border-[#166534] px-2 py-0.5 rounded font-bold">
                        Dedicated Coordinator
                      </span>
                    ) : (
                      <span className="bg-[#FEF3C7] text-[#92400E] border border-[#92400E] px-2 py-0.5 rounded font-bold">
                        Classroom Teacher
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: USER ACCOUNTS TABLE */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-5 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <h3 className="text-sm font-mono font-bold text-[#1A1A1A] uppercase tracking-wider mb-3">
          USER ACCOUNTS & ASSIGNMENTS ({usersList.length})
        </h3>

        <div className="overflow-x-auto border-2 border-[#1A1A1A] rounded">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1A1A1A] text-white">
              <tr>
                <th className="p-2.5">NAME</th>
                <th className="p-2.5">EMAIL</th>
                <th className="p-2.5">ROLE</th>
                <th className="p-2.5">ASSIGNED SCHOOL</th>
                <th className="p-2.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-2.5 font-bold text-[#1A1A1A]">{u.name}</td>
                  <td className="p-2.5 text-gray-600">{u.email}</td>
                  <td className="p-2.5">
                    {u.role === 'admin' ? (
                      <span className="bg-amber-100 text-[#92400E] border border-[#92400E] px-2 py-0.5 rounded font-bold">
                        👑 ADMIN
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-900 border border-blue-900 px-2 py-0.5 rounded font-bold">
                        📱 ENTRY / TEACHER
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-gray-700 font-semibold">
                    {u.schoolName || 'All Schools (Global Admin)'}
                  </td>
                  <td className="p-2.5 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setSelectedUserForReset(u);
                          setShowResetPasswordModal(true);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 border border-[#1A1A1A] px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 ml-auto"
                      >
                        <KeyRound className="w-3 h-3" /> Reset Password
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD SCHOOL */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] rounded-md max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#1A1A1A] space-y-4">
            <h3 className="text-lg font-mono font-extrabold text-[#1A1A1A] uppercase border-b-2 border-[#1A1A1A] pb-2">
              ADD NEW PARTNER SCHOOL
            </h3>

            <form onSubmit={handleAddSchool} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block font-bold mb-1">SCHOOL NAME:</label>
                <input
                  type="text"
                  placeholder="e.g. St. Jude Regional Academy"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">COMMUTE TIME (MINUTES FROM HQ):</label>
                <input
                  type="number"
                  value={commuteTime}
                  onChange={(e) => setCommuteTime(Number(e.target.value))}
                  className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hasStaff"
                  checked={hasDedicatedStaff}
                  onChange={(e) => setHasDedicatedStaff(e.target.checked)}
                  className="w-4 h-4 accent-[#1D4ED8]"
                />
                <label htmlFor="hasStaff" className="font-bold text-gray-800">
                  Has Dedicated Lab Coordinator
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-3 py-1.5 border border-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1D4ED8] text-white border border-[#1A1A1A] rounded font-bold shadow-[2px_2px_0px_0px_#1A1A1A]"
                >
                  Save School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] rounded-md max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#1A1A1A] space-y-4">
            <h3 className="text-lg font-mono font-extrabold text-[#1A1A1A] uppercase border-b-2 border-[#1A1A1A] pb-2">
              ADD USER ACCOUNT
            </h3>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block font-bold mb-1">FULL NAME:</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">EMAIL ADDRESS:</label>
                <input
                  type="email"
                  placeholder="sarah@school.edu"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">INITIAL PASSWORD:</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">ROLE:</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as 'entry' | 'admin')}
                  className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 font-bold focus:outline-none"
                >
                  <option value="entry">Entry (Teacher / Lab Coordinator)</option>
                  <option value="admin">Admin (Program Manager / Product Team)</option>
                </select>
              </div>

              {userRole === 'entry' && (
                <div>
                  <label className="block font-bold mb-1">ASSIGNED SCHOOL:</label>
                  <select
                    value={userSchoolId}
                    onChange={(e) => setUserSchoolId(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 font-bold focus:outline-none"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 border border-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1D4ED8] text-white border border-[#1A1A1A] rounded font-bold shadow-[2px_2px_0px_0px_#1A1A1A]"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {showResetPasswordModal && selectedUserForReset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] rounded-md max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_#1A1A1A] space-y-4">
            <h3 className="text-base font-mono font-extrabold text-[#1A1A1A] uppercase border-b-2 border-[#1A1A1A] pb-2">
              RESET PASSWORD
            </h3>

            <p className="text-xs font-mono text-gray-700">
              Resetting password for <strong>{selectedUserForReset.name}</strong> ({selectedUserForReset.email})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block font-bold mb-1">NEW PASSWORD:</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 font-mono font-bold focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-3 py-1.5 border border-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#991B1B] text-white border border-[#1A1A1A] rounded font-bold shadow-[2px_2px_0px_0px_#1A1A1A]"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
