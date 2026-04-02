import React from 'react';

interface RubricInputProps 
{
  label: string;
  value: number;
  onChange: (val: number) => void;
}

const RubricInput: React.FC<RubricInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="mb-6">
      <p className="text-gray-700 font-semibold mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              value === num 
                ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-110' 
                : 'border-gray-300 text-gray-500 hover:border-purple-400'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RubricInput;