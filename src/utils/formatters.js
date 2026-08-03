// Utility Helper Functions for NutriSoil

export const formatScore = (score) => {
  const num = parseFloat(score);
  return isNaN(num) ? '84.5' : num.toFixed(1);
};

export const formatPercentage = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '0%' : `${num.toFixed(0)}%`;
};

export const formatPh = (ph) => {
  const num = parseFloat(ph);
  return isNaN(num) ? '6.8' : num.toFixed(1);
};

export const formatNitrogen = (n) => {
  const num = parseFloat(n);
  return isNaN(num) ? '135' : `${Math.round(num)} mg/kg`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'OPTIMAL':
      return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'FAIR':
      return { bg: '#FFF3E0', text: '#F57C00' };
    case 'CRITICAL':
      return { bg: '#FFEBEE', text: '#C62828' };
    default:
      return { bg: '#E8F5E9', text: '#2E7D32' };
  }
};
