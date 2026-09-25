import React from 'react';
import type { PatientScreen } from '../../preconsultation/types';
import PreConsultationApp from '../../preconsultation/PreConsultationApp';
import { LanguageProvider } from '../../preconsultation/context/LanguageContext';

/**
 * Full CASE LINE pre-consultation workflow imported from the interface package.
 * Kept isolated so the existing CASE LINE dashboard and ecosystem remain unchanged.
 */
interface PreConsultationFlowProps {
  initialScreen?: PatientScreen;
}

export const PreConsultationFlow: React.FC<PreConsultationFlowProps> = ({ initialScreen = "welcome" }) => {
  return (
    <LanguageProvider>
      <PreConsultationApp initialScreen={initialScreen} />
    </LanguageProvider>
  );
};
