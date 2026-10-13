import React from 'react';
import { AboutUs } from '../../components/about/AboutUs';

interface AboutUsPageProps {
  navigate: (route: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-6xl mx-auto py-2">
      <AboutUs navigate={navigate} />
    </div>
  );
};
