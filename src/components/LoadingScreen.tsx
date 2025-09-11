import { useEffect, useRef, useState } from 'react';
import styles from './LoadingScreen.module.css';
import MotionSection from './MotionSection';

const LoadingScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const STEP_DURATION = 6500;
    const FADE_DURATION = 300;
    let step = 1;
    setCurrentStep(step);

    const progressToNextStep = () => {
      if (step < 3) {
        setIsTransitioning(true);
        setTimeout(() => {
          step = step + 1;
          setCurrentStep(step);
          setTimeout(() => {
            setIsTransitioning(false);
            if (step < 3) setTimeout(progressToNextStep, STEP_DURATION);
          }, FADE_DURATION / 2);
        }, FADE_DURATION / 2);
      }
    };

    const firstTimeout = setTimeout(progressToNextStep, STEP_DURATION);
    return () => clearTimeout(firstTimeout);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const pointerStart = (clientX: number) => {
      isDown = true;
      el.classList.add('dragging');
      startX = clientX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const pointerMove = (clientX: number) => {
      if (!isDown) return;
      const x = clientX - el.offsetLeft;
      const walk = (x - startX) * 1;
      el.scrollLeft = scrollLeft - walk;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerStart(e.pageX);
    };
    const onPointerUp = () => {
      isDown = false;
      el.classList.remove('dragging');
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      e.preventDefault();
      pointerMove(e.pageX);
    };

    const onTouchStart = (e: TouchEvent) => {
      const clientX = e.touches[0].pageX;
      pointerStart(clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const clientX = e.touches[0].pageX;
      pointerMove(clientX);
    };

    // prefer pointer events if available
    el.addEventListener('pointerdown', onPointerDown as any);
    window.addEventListener('pointerup', onPointerUp as any);
    window.addEventListener('pointermove', onPointerMove as any);

    // fallback touch events
    el.addEventListener('touchstart', onTouchStart as any, { passive: true });
    el.addEventListener('touchmove', onTouchMove as any, { passive: false });
    el.addEventListener('touchend', onPointerUp as any);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown as any);
      window.removeEventListener('pointerup', onPointerUp as any);
      window.removeEventListener('pointermove', onPointerMove as any);

      el.removeEventListener('touchstart', onTouchStart as any);
      el.removeEventListener('touchmove', onTouchMove as any);
      el.removeEventListener('touchend', onPointerUp as any);
    };
  }, []);

  const renderStep1 = () => (
    <div className={styles.loadingContent}>
      <div className={styles.loadingFeatures}>
        <div className={styles.featureItem}><span>20+ years driving digital innovation</span></div>
        <div className={styles.featureItem}><span>100+ successful projects</span></div>
        <div className={styles.featureItem}><span>Expertise in Private Equity</span></div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.loadingContent}>
      <div className={styles.loadingDescriptionSection}>
        <h2 className={styles.loadingSubtitle}>From Due Diligence to Value Creation.</h2>
        <p className={styles.loadingDescription}>
          We help Private Equity firms and their portfolio companies maximize ROI and accelerate growth through technology.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.loadingContent}>
      <div className={styles.loadingServicesSection}>
        <h2 className={styles.loadingSubtitle}>How We Help?</h2>
        <div className={styles.servicesCarousel} ref={carouselRef}>
          <div className={styles.serviceCard}><span>Technology Due Diligence</span></div>
          <div className={styles.serviceCard}><span>Transformation & Value Creation</span></div>
          <div className={styles.serviceCard}><span>Operational Excellence</span></div>
        </div>
      </div>
    </div>
  );

  return (
    <MotionSection animateKey={`loading-step-${currentStep}`} duration={500} className={styles.loadingScreen}>
      <div className={styles.loadingSection}>
        {/* Static header: main title, divider and loader spinner */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <h1 className={styles.loadingMainTitle}>
            Making Sense
            <br />
            Technology for smarter
            <br />
            investments.
          </h1>

          <div className={styles.loadingDivider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerDot} style={{ background: 'linear-gradient(90deg, #0ecc7e 0%, #53c0d2 100%)' }}></div>
          </div>

          <div className={styles.loadingSpinner} aria-hidden>
            <svg className={styles.loadingSpinnerSvg} viewBox="0 0 50 50" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="20" stroke="#e6f6f2" strokeWidth="6" />
              <path d="M45 25a20 20 0 0 1-20 20" stroke="#53c0d2" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {isTransitioning ? null : (
          <div className={styles.loadingInner}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
        )}
      </div>
    </MotionSection>
  );
};

export default LoadingScreen;
