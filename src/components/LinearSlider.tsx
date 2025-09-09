import { useState, useEffect } from 'react';
import type { FC } from 'react';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const LinearSlider: FC<Props> = ({ value, onChange }) => {
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
    <div className="linear-slider-container">
      <div className="linear-slider-result">
        <div className="linear-slider-percentage">{Math.round(localValue)}%</div>
        <div className="linear-slider-label">RISK TOLERANCE</div>
      </div>
      
      <div className="linear-slider-controls">
        <div className="linear-slider-track-container">
          <div className="linear-slider-track-bg"></div>
          <div className="linear-slider-track-white"></div>
          <div 
            className="linear-slider-track-filled"
            style={{ width: `${(localValue / 100) * 100}%` }}
          ></div>
          <input
            type="range"
            min={0}
            max={100}
            value={localValue}
            onChange={handleInputChange}
            className="linear-slider-input"
            aria-label="Adjust value"
          />
        </div>
      </div>
    </div>
  );
};

export default LinearSlider;
