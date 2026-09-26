import React from 'react';
import { StudentPlanner } from '../../components/planner/StudentPlanner';

interface StudentPlannerPageProps {
  navigate: (route: string) => void;
}

export const StudentPlannerPage: React.FC<StudentPlannerPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-7xl mx-auto py-2">
      <StudentPlanner navigate={navigate} />
    </div>
  );
};
