import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useProfileStore } from '../stores/profileStore';
import { useTaskStore } from '../stores/taskStore';
import { useHabitsStore } from '../stores/habitsStore';
import { useNotesStore } from '../stores/notesStore';
import type { Profile } from '../types';
import { Save, Medal, UploadCloud } from 'lucide-react';
import AvatarPlaceholder from '../assets/avatar-placeholder.png';

const defaultProfile: Profile = {
  name: 'Student Name',
  email: 'student@studyflow.io',
  major: 'Undeclared',
  year: 'Freshman',
  bio: 'A motivated learner building smarter habits and study routines.',
  studyGoal: 'Stay consistent and track progress every day.',
  university: '',
  department: '',
  semester: '',
  studentId: '',
  avatar: '',
};

export const ProfilePage: React.FC = () => {
  const { profile = defaultProfile, updateProfile } = useProfileStore();
  const completedTasks = useTaskStore((state) => state.tasks?.filter((task) => task.status === 'done').length ?? 0);
  const habits = useHabitsStore((state) => state.habits?.length ?? 0);
  const notes = useNotesStore((state) => state.notes?.length ?? 0);

  const [editProfile, setEditProfile] = useState<Profile>(profile ?? defaultProfile);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = async (file?: File) => {
    if (!file) return;
    setErrorMsg(null);
    if (file.size > 200 * 1024) {
      setErrorMsg('Image must be under 200KB to prevent local storage limits.');
      return;
    }
    try {
      const b64 = await fileToBase64(file);
      setEditProfile((current) => ({ ...current, avatar: b64 }));
    } catch {
      // ignore file errors silently
    }
  };

  const onSelectFileClick = () => inputRef.current?.click();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editProfile ?? defaultProfile);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-text-muted mb-2">Profile hub</p>
          <h1 className="text-3xl font-semibold text-text-primary">Your study persona and progress</h1>
        </div>
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
          Achievements <span className="font-semibold text-text-primary">{completedTasks} tasks</span>
        </div>
      </div>

      <motion.section className="card grid gap-6 lg:grid-cols-[0.9fr_0.7fr]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="rounded-full overflow-hidden w-16 h-16 bg-accent/5 p-0">
              <img src={profile.avatar || AvatarPlaceholder} alt="avatar" className="w-16 h-16 object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{profile.name}</h2>
              <p className="text-sm text-text-secondary">{profile.major} · {profile.year}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-border-subtle bg-bg-elevated p-5">
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>Completed tasks</span>
              <span className="font-semibold text-text-primary">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>Habits tracked</span>
              <span className="font-semibold text-text-primary">{habits}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>Notes saved</span>
              <span className="font-semibold text-text-primary">{notes}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-semibold text-amber-200 mb-2">
              <Medal size={16} /> Study goals badge
            </div>
            <p>{profile.studyGoal}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid gap-4 rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-md">
          <div className="flex items-center gap-4">
            <img
              src={editProfile.avatar || AvatarPlaceholder}
              alt="avatar preview"
              className="w-16 h-16 rounded-full border border-border-subtle object-cover"
            />
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-muted">Avatar</label>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={onSelectFileClick}
                className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface"
              >
                <UploadCloud size={16} /> Upload avatar
              </button>
              {errorMsg && (
                <span className="text-[10px] text-danger-color font-semibold mt-1">
                  {errorMsg}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">Full name</label>
            <input
              value={editProfile.name ?? defaultProfile.name}
              onChange={(e) => setEditProfile((current) => ({ ...current, name: e.target.value }))}
              className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">Email address</label>
            <input
              type="email"
              value={editProfile.email ?? defaultProfile.email}
              onChange={(e) => setEditProfile((current) => ({ ...current, email: e.target.value }))}
              className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">Major</label>
              <input
                value={editProfile.major ?? defaultProfile.major}
                onChange={(e) => setEditProfile((current) => ({ ...current, major: e.target.value }))}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">Year</label>
              <input
                value={editProfile.year ?? defaultProfile.year}
                onChange={(e) => setEditProfile((current) => ({ ...current, year: e.target.value }))}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">University</label>
              <input
                value={editProfile.university ?? defaultProfile.university}
                onChange={(e) => setEditProfile((current) => ({ ...current, university: e.target.value }))}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">Department</label>
              <input
                value={editProfile.department ?? defaultProfile.department}
                onChange={(e) => setEditProfile((current) => ({ ...current, department: e.target.value }))}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">Semester</label>
              <input
                value={editProfile.semester ?? defaultProfile.semester}
                onChange={(e) => setEditProfile((current) => ({ ...current, semester: e.target.value }))}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">Student ID</label>
              <input
                value={editProfile.studentId ?? defaultProfile.studentId}
                onChange={(e) => setEditProfile((current) => ({ ...current, studentId: e.target.value }))}
                className="w-full rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">Bio</label>
            <textarea
              value={editProfile.bio ?? defaultProfile.bio}
              onChange={(e) => setEditProfile((current) => ({ ...current, bio: e.target.value }))}
              rows={3}
              className="w-full rounded-3xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-muted">Study goal</label>
            <textarea
              value={editProfile.studyGoal ?? defaultProfile.studyGoal}
              onChange={(e) => setEditProfile((current) => ({ ...current, studyGoal: e.target.value }))}
              rows={2}
              className="w-full rounded-3xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-accent-hover"
          >
            <Save size={14} /> Save profile
          </button>
        </form>
      </motion.section>
    </div>
  );
};
