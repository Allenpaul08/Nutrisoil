import React from 'react';
import CropCard from './CropCard';
import { useLanguage } from '../context/LanguageContext';

const CropRecommendation = () => {
  const { isTa } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <CropCard
        cropName={isTa ? 'நெல் (Paddy)' : 'Paddy (Rice)'}
        matchRate="95% Match"
        yieldText={isTa ? 'எதிர்பார்க்கப்படும் விளைச்சல்: 2.8 - 3.2 டன் / ஏக்கர்' : 'Expected Yield: 2.8 - 3.2 Tons / Acre'}
        isPrimary={true}
      />

      <CropCard
        cropName={isTa ? 'கரும்பு (Sugarcane)' : 'Sugarcane'}
        matchRate="88% Match"
        yieldText={isTa ? 'எதிர்பார்க்கப்படும் விளைச்சல்: 40 - 45 டன் / ஏக்கர்' : 'Expected Yield: 40 - 45 Tons / Acre'}
        isPrimary={false}
      />
    </div>
  );
};

export default CropRecommendation;
