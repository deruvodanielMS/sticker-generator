import React, { useState, useEffect } from 'react';
import styles from './LinearSlider.module.css';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const LinearSlider = ({ value, onChange }: Props) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(Number(e.target.value));
  };

  const filledWidth = Math.max((localValue / 100) * 100, 10); // Minimum 10% to show some progress
  const thumbPosition = (localValue / 100) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.result}>
        <div className={styles.percentage}>{Math.round(localValue)}%</div>
        <div className={styles.label}>RISK TOLERANCE</div>
      </div>

      <div className={styles.controls}>
        <div className={styles.sliderContainer}>
          {/* Blur shadow effect */}
          <div className={styles.trackBlur} />
          
          {/* White background track */}
          <div className={styles.trackWhite} />
          
          {/* Filled gradient track */}
          <div
            className={styles.trackFilled}
            style={{ 
              '--filled-width': `${filledWidth}%`
            } as React.CSSProperties}
          />
          
          {/* Glow effect behind thumb */}
          <div
            className={styles.sliderThumbGlow}
            style={{ 
              '--thumb-position': `${thumbPosition}%`
            } as React.CSSProperties}
          />
          
          {/* Thumb handle */}
          <div
            className={styles.sliderThumb}
            style={{ 
              '--thumb-position': `${thumbPosition}%`
            } as React.CSSProperties}
          />

          {/* Hidden input for interaction */}
          <input
            type="range"
            min={0}
            max={100}
            value={localValue}
            onChange={handleInputChange}
            className={styles.input}
            aria-label="Risk tolerance percentage"
          />
        </div>

        {/* Labels */}
        <div className={styles.labels}>
          <div className={styles.labelItem}>LOW</div>
          <div className={styles.labelItem}>MEDIUM</div>
          <div className={styles.labelItem}>HIGH</div>
        </div>
      </div>
    </div>
  );
};

export default LinearSlider;
