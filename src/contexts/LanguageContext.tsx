import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import LoadingOverlay from '../components/LoadingOverlay';

interface LanguageContextType {
  language: 'tr' | 'en';
  toggleLanguage: () => void;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translation cache to avoid repeated API calls
const translationCache = new Map<string, string>();

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'tr' | 'en'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'tr' | 'en') || 'tr';
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const loading = useAutoTranslate(language);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'tr' ? 'en' : 'tr');
  };

  const translate = async (text: string): Promise<string> => {
    if (!text || text.trim() === '') return text;
    
    const cacheKey = `${text}_${language}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    setIsTranslating(true);
    try {
      // Using a simple translation service (you can replace with Google Translate API)
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${language === 'tr' ? 'tr|en' : 'en|tr'}`);
      const data = await response.json();
      
      if (data.responseStatus === 200) {
        const translated = data.responseData.translatedText;
        translationCache.set(cacheKey, translated);
        return translated;
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
    
    return text; // Return original text if translation fails
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translate, isTranslating }}>
      {children}
      {loading && <LoadingOverlay message="Sayfa otomatik olarak çevriliyor..." />}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};