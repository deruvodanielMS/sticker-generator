import type { FC, ReactNode } from 'react';

import React, { FC, ReactNode } from 'react';
import styles from './ErrorBanner.module.css';

type Props = { children: ReactNode };

const ErrorBanner: FC<Props> = ({ children }) => (
  <div className={styles.errorBanner} role="alert">{children}</div>
);

export default ErrorBanner;
