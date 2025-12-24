'use client';

import { AlertTriangle, Calendar } from 'lucide-react';

interface InsuranceWarningProps {
  insuranceExpiry: Date;
  liabilityInsuranceExpiry?: Date;
}

export default function InsuranceWarning({ insuranceExpiry, liabilityInsuranceExpiry }: InsuranceWarningProps) {
  const today = new Date();
  const daysUntilExpiry = Math.ceil((insuranceExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let liabilityDaysUntilExpiry = 0;
  if (liabilityInsuranceExpiry) {
    liabilityDaysUntilExpiry = Math.ceil((liabilityInsuranceExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const getWarningLevel = (days: number) => {
    if (days <= 0) return 'expired';
    if (days <= 30) return 'critical';
    if (days <= 60) return 'warning';
    return 'safe';
  };

  const insuranceWarning = getWarningLevel(daysUntilExpiry);
  const liabilityWarning = liabilityInsuranceExpiry ? getWarningLevel(liabilityDaysUntilExpiry) : null;

  const getWarningColor = (level: string) => {
    switch (level) {
      case 'expired': return 'bg-red-50 border-red-200 text-red-800';
      case 'critical': return 'bg-red-100 border-red-300 text-red-900';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getWarningMessage = (type: string, days: number, level: string) => {
    if (level === 'expired') return `${type} has expired!`;
    if (level === 'critical') return `${type} expires in ${days} days!`;
    if (level === 'warning') return `${type} expires in ${days} days`;
    return `${type} expires on ${new Date(insuranceExpiry).toLocaleDateString()}`;
  };

  return (
    <div className="space-y-3">
      {/* Regular Insurance Warning */}
      <div className={`border rounded-lg p-3 ${getWarningColor(insuranceWarning)}`}>
        <div className="flex items-start gap-2">
          {insuranceWarning !== 'safe' && (
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
              insuranceWarning === 'expired' ? 'text-red-600' :
              insuranceWarning === 'critical' ? 'text-red-600' :
              'text-orange-600'
            }`} />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">Vehicle Insurance</span>
              <span className="text-sm">{getWarningMessage('Insurance', daysUntilExpiry, insuranceWarning)}</span>
            </div>
            <div className="text-sm mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Expires: {insuranceExpiry.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Liability Insurance Warning */}
      {liabilityInsuranceExpiry && (
        <div className={`border rounded-lg p-3 ${getWarningColor(liabilityWarning || 'safe')}`}>
          <div className="flex items-start gap-2">
            {liabilityWarning && liabilityWarning !== 'safe' && (
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                liabilityWarning === 'expired' ? 'text-red-600' :
                liabilityWarning === 'critical' ? 'text-red-600' :
                'text-orange-600'
              }`} />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">Liability Insurance</span>
                {liabilityWarning && (
                  <span className="text-sm">
                    {getWarningMessage('Liability Insurance', liabilityDaysUntilExpiry, liabilityWarning)}
                  </span>
                )}
              </div>
              <div className="text-sm mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Expires: {liabilityInsuranceExpiry.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}