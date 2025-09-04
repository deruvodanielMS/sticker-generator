import type { FC } from 'react';
import type { Question } from '../types';

type Props = {
  question: Question;
  selected?: string;
  onSelect: (optionId: string) => void;
  onNext: () => void;
  step: number;
  total: number;
};

const QuestionScreen: FC<Props> = ({ question, selected, onSelect, onNext, step, total }) => {
  return (
    <div className="screen-container">
      <div className="progress-indicator">Question {step} of {total}</div>
      <h2 className="question-title">{question.title}</h2>
      <div className="options-grid">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            className={`option-card ${selected === opt.id ? 'selected' : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            <span className="option-label">{opt.label}</span>
          </button>
        ))}
      </div>
      <button className="primary-button next-button" onClick={onNext} disabled={!selected}>
        Next
      </button>
    </div>
  );
};

export default QuestionScreen;
