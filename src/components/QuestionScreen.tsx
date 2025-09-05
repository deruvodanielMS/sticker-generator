import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { Question } from '../types';

type Props = {
  question: Question;
  selected?: { choice: string; intensity?: number };
  onSelect: (optionId: string, intensity?: number) => void;
  onNext: () => void;
  step: number;
  total: number;
};

const QuestionScreen: FC<Props> = ({ question, selected, onSelect, onNext, step, total }) => {
  const [localIntensity, setLocalIntensity] = useState<number>(selected?.intensity ?? 5);

  useEffect(() => {
    setLocalIntensity(selected?.intensity ?? 5);
  }, [selected]);

  const handleOptionClick = (optId: string) => {
    onSelect(optId, localIntensity);
  };

  return (
    <div className="screen-container">
      <div className="progress-indicator">Question {step} of {total}</div>
      <h2 className="question-title">{question.title}</h2>
      <div className="options-grid">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            className={`option-card ${selected?.choice === opt.id ? 'selected' : ''}`}
            onClick={() => handleOptionClick(opt.id)}
          >
            <span className="option-label">{opt.label}</span>
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

      <button className="primary-button next-button" onClick={onNext} disabled={!selected}>
        Next
      </button>
    </div>
  );
};

export default QuestionScreen;
