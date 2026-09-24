import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { fetchStudentJoinedClasses } from '../../services/teacherService';
import { ClassRoom } from '../../types';
import { JoinClassSection } from './JoinClassSection';
import {
  GraduationCap,
  Users,
  BookOpen,
  School,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface StudentClassesWidgetProps {
  navigate?: (route: string) => void;
  className?: string;
}

export const StudentClassesWidget: React.FC<StudentClassesWidgetProps> = ({
  navigate,
  className = '',
}) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJoinedClasses = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const res = await fetchStudentJoinedClasses(userProfile.uid);
      setClasses(res);
    } catch (err) {
      console.error('Error fetching joined classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJoinedClasses();
  }, [userProfile?.uid, userProfile?.joinedClasses]);

  const handleClassJoined = (newClass: ClassRoom) => {
    setClasses((prev) => {
      if (prev.some((c) => c.id === newClass.id)) return prev;
      return [newClass, ...prev];
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
              Bilik Darjah Saya ({classes.length})
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Kelas aktif yang didaftarkan bersama guru anda
            </p>
          </div>
        </div>

        {/* Modal Trigger for Joining Class */}
        <JoinClassSection
          showModalTriggerOnly
          onClassJoined={handleClassJoined}
        />
      </div>

      {/* Grid of Enrolled Classes or Empty / Initial State with Join Class Form */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 rounded-3xl bg-stone-100 dark:bg-stone-800/40 animate-pulse border border-stone-200/50 dark:border-stone-800"
            />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="space-y-4">
          <JoinClassSection onClassJoined={handleClassJoined} />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800/80 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {cls.tingkatan}
                    </span>
                    <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cls.studentCount || cls.studentIds?.length || 0} murid
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {cls.name}
                  </h3>

                  <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{cls.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                      <BookOpen className="w-3 h-3" />
                      <span>Subjek: {cls.subject}</span>
                    </div>
                    {cls.schoolName && (
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 truncate">
                        <School className="w-3 h-3" />
                        <span>{cls.schoolName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-md">
                    Kod: {cls.joinCode}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Telah Disertai</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick inline box to join more classes */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-dashed border-stone-300 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-300">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Mempunyai kod jemputan kelas lain daripada guru anda?</span>
            </div>
            <JoinClassSection
              showModalTriggerOnly
              onClassJoined={handleClassJoined}
            />
          </div>
        </div>
      )}
    </div>
  );
};
