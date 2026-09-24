import React from 'react';
import { TeacherSubmissions } from '../../components/teacher/TeacherSubmissions';

interface TeacherSubmissionsPageProps {
  assignmentId?: string;
  navigate: (route: string) => void;
}

export const TeacherSubmissionsPage: React.FC<TeacherSubmissionsPageProps> = ({
  assignmentId,
  navigate,
}) => {
  return (
    <TeacherSubmissions
      assignmentId={assignmentId}
      navigate={navigate}
      onBack={() => navigate('/teacher/assignments')}
    />
  );
};
