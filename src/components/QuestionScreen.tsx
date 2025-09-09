import React, { FC } from 'react';
import type { Question } from '../types';
import Stepper from './Stepper';
import LinearSlider from './LinearSlider';
import RadioListQuestion from './RadioListQuestion';
import styles from './QuestionScreen.module.css';
import Button from './ui/Button';

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
  const handleOptionClick = (optId: string) => {
    onSelect(optId);
  };

  const handleDialChange = (value: number) => {
    // For dial questions, we map the value to the appropriate option
    let optionId = 'low';
    if (value >= 75) optionId = 'high';
    else if (value >= 25) optionId = 'medium';
    onSelect(optionId, value);
  };

  const getDialValue = () => {
    if (!selected?.choice) return 0;
    const option = question.options.find(opt => opt.id === selected.choice);
    return option?.value || 0;
  };

  const renderQuestionContent = () => {
    const layout = question.layout || 'icons';

    switch (layout) {
      case 'dial':
        return (
          <LinearSlider

            value={getDialValue()}
            onChange={handleDialChange}
          />
        );

      case 'radio-list':
        return (
          <RadioListQuestion
            options={question.options}
            selectedId={selected?.choice}
            onSelect={(optId) => onSelect(optId)}
          />
        );

      case 'icons':
      default:
        return (
          <div className={styles.questionOptions}>
            {question.options.map((option) => (
              <button
                key={option.id}
                className={`${styles.questionOption} ${selected?.choice === option.id ? styles.questionOptionSelected : ''}`}
                onClick={() => handleOptionClick(option.id)}
              >
                {option.icon && (
                  <span className={styles.optionIconWrap}>
                    <img
                      src={option.icon}
                      alt={`${option.label} icon`}
                      className={styles.optionIcon}
                    />
                  </span>
                )}
                <span className={styles.optionLabel}>{option.label}</span>
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={styles.questionScreen}>
      <Stepper 
        currentStep={step} 
        totalSteps={total} 
        onClose={onClose}
      />
      
      <div className={styles.questionContent}>
        <div className={styles.questionSection}>
          <h1 className={styles.questionTitle}>{question.title}</h1>
          
          {renderQuestionContent()}
          
          <div className={styles.questionNavigation}>
            <Button variant="secondary" onClick={onPrevious} disabled={step === 1}>PREVIOUS</Button>
            <Button variant="primary" onClick={onNext} disabled={!selected}>{step === total ? 'FINISH' : 'NEXT'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;
