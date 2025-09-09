import React, { FormEvent, useState } from 'react';
import styles from './NameInput.module.css';
import Button from './ui/Button';

type Props = { onContinue: (name: string) => void };

const NameInput = ({ onContinue }: Props) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onContinue(name.trim());
    }
  };

  return (
    <div className={styles.nameScreen}>
      <div className={styles.nameSection}>
        <h1 className={styles.nameTitle}>What should I call you?</h1>

        <form onSubmit={handleSubmit} className={styles.nameForm}>
          <div className={styles.nameInputWrapper}>
            <input
              type="text"
              className={styles.nameInput}
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <Button type="submit" variant="primary" disabled={!name.trim()}>CONTINUE</Button>
        </form>
      </div>
    </div>
  );
};

export default NameInput;
