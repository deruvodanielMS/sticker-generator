import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { Question } from '../types';
import Stepper from './Stepper';

type Props = {
  question: Question;
  selected?: { choice: string; intensity?: number };
  onSelect: (optionId: string, intensity?: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  step: number;
  total: number;
};

const QuestionScreen: FC<Props> = ({ 
  question, 
  selected, 
  onSelect, 
  onNext, 
  onPrevious,
  onClose,
  step, 
  total 
}) => {
  const [localIntensity, setLocalIntensity] = useState<number>(selected?.intensity ?? 5);

  useEffect(() => {
    setLocalIntensity(selected?.intensity ?? 5);
  }, [selected]);

  const handleOptionClick = (optId: string) => {
    onSelect(optId, localIntensity);
  };

  return (
    <div className="question-screen">
      <Stepper 
        currentStep={step} 
        totalSteps={total} 
        onClose={onClose}
      />
      
      <div className="question-content">
        <div className="question-section">
          <h1 className="question-title">{question.title}</h1>
          
          <div className="question-options">
            {question.options.map((option) => (
              <button
                key={option.id}
                className={`question-option ${selected?.choice === option.id ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option.id)}
              >
                {option.icon && (
                  <img 
                    src={option.icon} 
                    alt={`${option.label} icon`}
                    className="option-icon"
                  />
                )}
                <span className="option-label">{option.label}</span>
              </button>
            ))}
          </div>
          
          <div className="intensity-control">
            <label className="intensity-label">Intensity: {localIntensity}</label>
            <input
              className="intensity-range"
              type="range"
              min={1}
              max={10}
              value={localIntensity}
              onChange={(e) => {
                const v = Number(e.target.value);
                setLocalIntensity(v);
                if (selected?.choice) onSelect(selected.choice, v);
              }}
            />
          </div>
          
          <div className="question-navigation">
            <button 
              className="nav-button secondary"
              onClick={onPrevious}
              disabled={step === 1}
            >
              PREVIOUS
            </button>
            
            <button 
              className="nav-button primary"
              onClick={onNext}
              disabled={!selected}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;
