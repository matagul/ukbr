import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage, isTranslating } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      disabled={isTranslating}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      aria-label={`Switch to ${language === 'tr' ? 'English' : 'Turkish'}`}
    >
      <Languages className="w-5 h-5" />
      <span className="text-sm font-medium">{language.toUpperCase()}</span>
      {isTranslating && (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
    </button>
  );
};

export default LanguageToggle;