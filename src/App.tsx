import { useState, useEffect, useMemo } from 'react';
import SplashScreen from './components/SplashScreen';
import NameInput from './components/NameInput';
import QuestionScreen from './components/QuestionScreen';
import EmailCapture from './components/EmailCapture';
import PhotoCapture from './components/PhotoCapture';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';
import ThankYouScreen from './components/ThankYouScreen';
import ErrorBanner from './components/ErrorBanner';
import { QUESTIONS } from './data/questions';
import type { Answers, GenerationResult } from './types';
import { deriveArchetype } from './utils/archetype';
import { generateSticker } from './services/imageService';

const STEPS = {
  Splash: 0,
  NameInput: 1,
  Questions: 2,
  EmailCapture: 3,
  PhotoIntro: 4,
  Photo: 5,
  PromptPreview: 6,
  Generating: 7,
  Result: 8,
  ThankYou: 9,
} as const;

function App() {
  const LOGO_FIGMA = 'https://api.builder.io/api/v1/image/assets/TEMP/7ac03e2ebbcf31266708d63245588e89126c6e4a?width=442';

  const [step, setStep] = useState<number>(STEPS.Splash);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [answers, setAnswers] = useState<Answers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | undefined>(undefined);

  const [generatedArchetype, setGeneratedArchetype] = useState<any | null>(null);

  const currentQuestion = QUESTIONS[questionIndex];
  const total = QUESTIONS.length;

  const setThemeOnDocument = (theme: 'light' | 'dark') => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  };

  // Simplified: set default theme and enable overlay after a short delay
  useEffect(() => {
    setThemeOnDocument('light');

    // ensure overlay starts hidden, then show after a small timeout
    document.documentElement.classList.remove('overlay-ready');
    const t = window.setTimeout(() => {
      document.documentElement.classList.add('overlay-ready');
    }, 300);

    // ONE-TIME fullscreen attempt triggered by first user interaction (gesture required by browsers)
    let attemptedFull = false;
    const tryFullscreen = async () => {
      if (attemptedFull) return;
      attemptedFull = true;
      try {
        const el = document.documentElement as any;
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) await el.msRequestFullscreen();
        // when fullscreen entered, the browser chrome will be hidden on supported devices
      } catch (e) {
        // ignore errors — many browsers will refuse or require user gesture
      }
      // remove listener after attempt
      window.removeEventListener('pointerdown', tryFullscreen);
    };
    window.addEventListener('pointerdown', tryFullscreen, { once: true });

    return () => {
      window.clearTimeout(t);
      document.documentElement.classList.remove('overlay-ready');
      try { window.removeEventListener('pointerdown', tryFullscreen); } catch (e) {}
    };
  }, []);

  // Particle background: generate deterministic particle config on mount to avoid reflows
  const particleConfig = useMemo(() => {
    const amount = 3; // simplified: only up to three moving spots
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    // Greens only: darker palette for dark theme, lighter palette for light theme
    const colors = dark
      ? ['#042f28', '#0a6b55', '#0ecc7e'] // dark greens -> deep, mid, bright
      : ['#bff7eb', '#73e6c9', '#0ecc7e']; // light greens -> soft, mid, bright

    const arr = new Array(amount).fill(0).map((_, i) => {
      const sizeVw = 10 + Math.floor(Math.random() * 12); // between 10vw and 22vw roughly
      const top = Math.floor(Math.random() * 90);
      const left = Math.floor(Math.random() * 90);
      const duration = (6 + Math.random() * 6).toFixed(2) + 's';
      const delay = '-' + (Math.random() * 6).toFixed(2) + 's';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const blur = Math.floor(8 + Math.random() * 24);
      const x = Math.random() > 0.5 ? -1 : 1;
      const boxShadow = `${sizeVw * 1.8 * x}px 0 ${blur}px ${color}`;
      const transformOrigin = `${Math.floor((Math.random() - 0.5) * 40)}vw ${Math.floor((Math.random() - 0.5) * 40)}vh`;
      return { sizeVw, top, left, duration, delay, color, boxShadow, transformOrigin, key: `p-${i}` };
    });
    return arr;
  }, []);

  const handleSelect = (optId: string, intensity?: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: { choice: optId, intensity } }));

    // When on the 'innovation' question (screen #2) and user chooses 'disruptive', switch to dark theme
    if (currentQuestion.id === 'innovation' && optId === 'disruptive') {
      setThemeOnDocument('dark');
    } else if (currentQuestion.id === 'innovation') {
      setThemeOnDocument('light');
    }
  };

  const handleNext = () => {
    setError(null);
    if (!answers[currentQuestion.id]) return;
    if (questionIndex < total - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      // After completing questions, go to Photo capture step (selfie first)
      setStep(STEPS.Photo);
    }
  };

  const handlePrevious = () => {
    setError(null);
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    } else {
      setStep(STEPS.NameInput);
    }
  };

  const handleCloseQuestions = () => {
    setStep(STEPS.Splash);
    setUserName('');
    setAnswers({});
    setQuestionIndex(0);
    setError(null);
    setThemeOnDocument('light');
  };

  const handleEmailSubmit = async (email: string) => {
    setUserEmail(email);
    // Now start generation process after email is captured
    await generateStickerAfterEmail();
  };

  const handleEmailSkip = async () => {
    setUserEmail(''); // Clear email if skipped
    // Start generation process even without email
    await generateStickerAfterEmail();
  };

  const submitUserData = async () => {
    try {
      await fetch('/api/submit-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: userName,
          email: userEmail,
          respuestas: answers,
          arquetipo: generatedArchetype || result?.archetype,
          imagenGenerada: result?.imageUrl
        })
      });
    } catch (error) {
      console.error('Error submitting user data:', error);
      // Don't block the user experience if submission fails
    }
  };


  // Store photo data and proceed to email capture
  const preparePrompt = async (maybeSelfie?: string) => {
    setCapturedPhoto(maybeSelfie);
    setStep(STEPS.EmailCapture);
  };

  // Generate sticker after email is captured
  const generateStickerAfterEmail = async () => {
    setError(null);
    try {
      if (!navigator.onLine) throw new Error('No internet connection. Please connect to continue.');

      // Build a deterministic prompt from answers first so it always reflects user's choices
      const fallbackArche = deriveArchetype(answers);
      setGeneratedArchetype(fallbackArche);


      // Build the required fixed prompt using collected answers and chosen archetype
      const findAnswerLabel = (qid: string) => {
        try {
          const q = QUESTIONS.find((qq) => qq.id === qid);
          const ans = answers[qid];
          if (!q || !ans) return 'N/A';
          const opt = q.options?.find((o: any) => o.id === ans.choice);
          if (opt && opt.label) return opt.label;
          // If no option found, fall back to any numeric/intensity value or choice id
          return ans?.choice ?? (ans?.intensity != null ? String(ans.intensity) : 'N/A');
        } catch (e) {
          return 'N/A';
        }
      };

      const promptTemplate = `Create an original, unique sticker that embodies the archetype "${fallbackArche?.name}". Avoid using\n- archetype label\n- any text into the image\n- white borders.\n- transparent background\nOutput a high-resolution PNG (at least 1024x1024) suitable for display and printing. StyleToken:v2338;Draw inspiration from the following traits: Which best describes your approach to making business decisions?: ${findAnswerLabel('decision_style')}; Which mindset do you most identify with when new technologies emerge?: ${findAnswerLabel('innovation')}; With new opportunities, how would you describe your risk tolerance?: ${findAnswerLabel('risk')}; When working on a team project, which approach best describes your style?: ${findAnswerLabel('collaboration')}; When defining your vision for the future, which area is your primary focus?: ${findAnswerLabel('vision')}. Produce a high-quality, visually engaging sticker concept — be creative with composition; use colors drawn from the chosen archetype's colorPalette (do not force a specific hue set). The design should feature a character in the middle with small illustrations in the background. The background should fill the complete image and may be a single color or a subtle gradient that complements the palette. The style should be clean, simple, flat, with no text on it.`;

      setStep(STEPS.Generating);
      const promptToUse = promptTemplate;
      const arche = generatedArchetype ?? fallbackArche;
      const photoStep = capturedPhoto ? 'sent' : 'skipped';
      const res = await generateSticker(arche, capturedPhoto, promptToUse, photoStep);
      setResult(res);
      setStep(STEPS.Result);
    } catch (e: any) {
      setError(e?.message || 'Failed to prepare or generate sticker');
      setStep(STEPS.Splash);
    }
  };

  const goToThankYou = async () => {
    await submitUserData();
    setStep(STEPS.ThankYou);
  };

  const restart = () => {
    setStep(STEPS.Splash);
    setUserName('');
    setUserEmail('');
    setAnswers({});
    setQuestionIndex(0);
    setError(null);
    setResult(null);
    setCapturedPhoto(undefined);
    setThemeOnDocument('light');
  };

  return (
    <div className="app-root">
      <div className="theme-overlay" aria-hidden>
        {particleConfig.map((p) => (
          <span
            key={p.key}
            className="theme-particle"
            style={{
              ['--tp-top' as any]: p.top + '%',
              ['--tp-left' as any]: p.left + '%',
              ['--tp-size' as any]: `min(${p.sizeVw}vmin, 140px)`,
              ['--tp-bg' as any]: p.color,
              ['--tp-shadow' as any]: p.boxShadow,
              ['--tp-transform-origin' as any]: p.transformOrigin,
              ['--tp-duration' as any]: p.duration,
              ['--tp-delay' as any]: p.delay,
            }}
          />
        ))}
      </div>

      <header className="app-header" aria-hidden>
        <img
          src={LOGO_FIGMA}
          alt="Making Sense"
          style={{
            display: 'flex',
            width: '221px',
            height: '28px',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexShrink: 0,
            aspectRatio: '221/28'
          }}
        />
      </header>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {step === STEPS.Splash && <SplashScreen onStart={() => setStep(STEPS.NameInput)} />}
      {step === STEPS.NameInput && <NameInput onContinue={(name) => { setUserName(name); setStep(STEPS.Questions); }} />}
      {step === STEPS.Questions && (
        <QuestionScreen
          question={currentQuestion}
          selected={answers[currentQuestion.id]}
          onSelect={handleSelect}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onClose={handleCloseQuestions}
          step={questionIndex + 1}
          total={total}
        />
      )}
      {step === STEPS.EmailCapture && (
        <EmailCapture onSubmit={handleEmailSubmit} onSkip={handleEmailSkip} />
      )}
      {step === STEPS.Photo && (
        <PhotoCapture onConfirm={(dataUrl?: string) => preparePrompt(dataUrl)} onSkip={() => preparePrompt(undefined)} />
      )}


      {step === STEPS.Generating && <LoadingScreen />}
      {step === STEPS.Result && result && <ResultScreen result={result} userName={userName} userEmail={userEmail} onShare={goToThankYou} onPrint={goToThankYou} onRestart={restart} />}
      {step === STEPS.ThankYou && <ThankYouScreen onRestart={restart} />}

      <footer className="app-footer">Making Sense - 2025. All rights reserved.</footer>
    </div>
  );
}

export default App;
