import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  onNavigate: (step: number) => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ currentStep, totalSteps, onNavigate, title }) => (
  <header className="app-bar">
    <button
      type="button"
      className="app-bar__icon"
      onClick={() => onNavigate(currentStep - 1)}
      disabled={currentStep === 1}
      aria-label="返回上一步"
    >
      <ChevronLeft size={24} />
    </button>
    <h1 className="app-bar__title">{title}</h1>
    <span className="app-bar__step" aria-label={`第 ${currentStep} 步，共 ${totalSteps} 步`}>
      {currentStep} / {totalSteps}
    </span>
  </header>
);
