import React, { memo } from 'react';
import { Brain } from 'lucide-react';

const AICalculationPanel = ({ calculationSteps }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 rounded-2xl shadow-2xl p-5 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Brain className="text-blue-400" size={24} />
        </div>
        <h3 className="font-bold text-lg">AI Calculation Process</h3>
      </div>
      <div className="space-y-2 text-sm font-mono max-h-64 overflow-y-auto">
        {calculationSteps.length > 0 ? (
          calculationSteps.map((step, i) => (
            <div
              key={i}
              className={`
                ${step.includes('DECISION') ? 'text-green-400 font-bold' : ''}
                ${step.includes('FORCED') ? 'text-yellow-400' : ''}
                ${step.includes('Step') ? 'text-blue-400 mt-2' : ''}
                ${step.includes('Exploring') || step.includes('Level') || step.includes('Depth') ? 'text-gray-400 ml-2' : ''}
                ${!step.includes('Step') && !step.includes('Exploring') && !step.includes('Level') && !step.includes('Depth') ? 'text-gray-300' : ''}
              `}
            >
              {step}
            </div>
          ))
        ) : (
          <div className="text-gray-500">Waiting for next turn...</div>
        )}
      </div>
    </div>
  );
};

export default memo(AICalculationPanel);


