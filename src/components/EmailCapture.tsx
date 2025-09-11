import { useState } from 'react';
import type { FormEvent } from 'react';
import styles from './EmailCapture.module.css';
import Button from './ui/Button';
import Divider from './ui/Divider';

type Props = { onSubmit: (email: string) => void; onSkip?: () => void; };

const EmailCapture = ({ onSubmit, onSkip }: Props) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email.trim());
    }
  };

  return (
    <div className={styles.emailScreen}>
      <div className={styles.emailSection}>
        <h1 className={styles.emailTitle}>Get Your AI Agent</h1>

        <Divider />

        <p className={styles.emailDescription}>
          Enter your email address below,
and we'll send your new AI Agent directly to your inbox.
        </p>

        <form onSubmit={handleSubmit} className={styles.emailForm}>
          <div className={styles.emailInputWrapper}>
            <input
              type="email"
              className={styles.emailInput}
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button className={styles.emailSubmitButton} type="submit" variant="primary">SUBMIT</Button>
        </form>
      </div>
    </div>
  );
};

export default EmailCapture;
