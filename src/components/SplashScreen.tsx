type Props = { onStart: () => void };

import React from 'react';
import styles from './SplashScreen.module.css';
import Button from './ui/Button';

type Props = { onStart: () => void };

const SplashScreen = ({ onStart }: Props) => {
  return (
    <div className={styles.welcomeScreen}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Find Your AI Agent</h1>

        <div className={styles.heroDivider}>
          <div className={styles.dividerLine}></div>
          <div className={styles.dividerDot}></div>
        </div>

        <p className={styles.heroDescription}>
          Uncover the digital ally that thinks like you, moves with you, and amplifies your every decision.<br /><br />
          In the fast pace of Private Equity, every choice shapes the future. Let your AI Agent be the silent partner that turns instinct into insight, and vision into value.
        </p>

        <div className={styles.heroButton}>
          <Button variant="primary" onClick={onStart}>LET'S START</Button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
