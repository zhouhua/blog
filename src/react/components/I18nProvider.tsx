import i18n from '@/i18n/config';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      i18n.changeLanguage(savedLocale);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
