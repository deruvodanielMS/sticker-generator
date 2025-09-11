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

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      el.classList.add('dragging');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      el.classList.remove('dragging');
    };
    const onMouseUp = () => {
      isDown = false;
      el.classList.remove('dragging');
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const renderStep1 = () => (
    <div className={styles.loadingContent}>
      <h1 className={styles.loadingMainTitle}>
        Making Sense
        <br />
        Technology for smarter
        <br />
        investments.
      </h1>
      <div className={styles.loadingFeatures}>
        <div className={styles.featureItem}><span>20+ years driving digital innovation</span></div>
        <div className={styles.featureItem}><span>100+ successful projects</span></div>
        <div className={styles.featureItem}><span>Expertise in Private Equity</span></div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.loadingContent}>
      <h1 className={styles.loadingMainTitle}>
        Making Sense
        <br />
        Technology for smarter
        <br />
        investments.
      </h1>
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
      <h1 className={styles.loadingMainTitle}>
        Making Sense
        <br />
        Technology for smarter
        <br />
        investments.
      </h1>
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
