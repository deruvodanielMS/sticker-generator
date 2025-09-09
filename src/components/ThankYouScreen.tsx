import React, { FC } from 'react';
import styles from './ThankYouScreen.module.css';
import Button from './ui/Button';

type Props = {
  onRestart: () => void;
};

const ThankYouScreen: FC<Props> = ({ onRestart }) => {
  return (
    <div className="screen-container">
      <div className={styles.section}>
        <h1 className={styles.title}>
          Leading digital transformation for<br />
          mid-market companies
        </h1>

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <svg width="5" height="4" viewBox="0 0 5 4" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.dividerDot}>
            <circle cx="2.5" cy="2" r="2" fill="url(#paint0_linear)"/>
            <defs>
              <linearGradient id="paint0_linear" x1="0.688744" y1="1.47298" x2="2.12203" y2="3.02577" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1EDD8E"/>
                <stop offset="1" stopColor="#53C0D2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p className={styles.description}>
          We create tailored technology solutions that enhance customer experiences,<br />
          drive lasting growth, and future-proof businesses.
        </p>

        <div className={styles.ctaWrap}>
          <Button variant="primary" onClick={onRestart}>START OVER</Button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouScreen;
