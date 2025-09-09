import React from 'react';
import styles from './Button.module.css';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  mobileFull?: boolean;
};

export default function Button({ variant = 'primary', mobileFull = true, className = '', children, ...rest }: Props) {
  const variantClass = variant === 'primary' ? styles.primary : variant === 'secondary' ? styles.secondary : styles.ghost;
  const mobileFullClass = mobileFull ? styles.fullWidthOnMobile : '';
  return (
    <button className={`${styles.btn} ${variantClass} ${mobileFullClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}
