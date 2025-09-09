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

  return (
    <div className={styles.container}>
      <div className={styles.result}>
        <div className={styles.percentage}>{Math.round(localValue)}%</div>
        <div className={styles.label}>RISK TOLERANCE</div>
      </div>

      <div className={styles.controls}>
        <div className={styles.trackContainer}>
          <div className={styles.trackBg} />
          <div className={styles.trackWhite} />
          <div
            className={styles.trackFilled}
            style={{ ['--filled-width' as any]: `${(localValue / 100) * 100}%` } as React.CSSProperties}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={localValue}
            onChange={handleInputChange}
            className={styles.input}
            aria-label="Adjust value"
          />
        </div>
      </div>
    </div>
  );
};

export default LinearSlider;
