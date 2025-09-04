import { useMemo, useState } from 'react';
import './App.css';
import SplashScreen from './components/SplashScreen';
import QuestionScreen from './components/QuestionScreen';
import PhotoCapture from './components/PhotoCapture';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';
import ErrorBanner from './components/ErrorBanner';
import { QUESTIONS } from './data/questions';
import type { Answers, GenerationResult } from './types';
import { deriveArchetype } from './utils/archetype';
import { generateSticker } from './services/imageService';

const STEPS = {
  Splash: 0,
  Questions: 1,
  Photo: 2,
  Generating: 3,
  Result: 4,
} as const;

function App() {
  const [step, setStep] = useState<number>(STEPS.Splash);
  const [answers, setAnswers] = useState<Answers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const currentQuestion = QUESTIONS[questionIndex];
  const total = QUESTIONS.length;

  const handleSelect = (optId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optId }));
  };

  const handleNext = () => {
    setError(null);
    if (!answers[currentQuestion.id]) return;
    if (questionIndex < total - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setStep(STEPS.Photo);
    }
  };

  const startGeneration = async (maybeSelfie?: string) => {
    setStep(STEPS.Generating);
    setError(null);
    try {
      if (!navigator.onLine) throw new Error('No internet connection. Please connect to continue.');

      // Try LLM to derive a rich archetype and prompt
      let generatedArchetype = null;
      let finalPrompt: string | undefined = undefined;
      try {
        const llm = await import('./services/llmService');
        const out = await llm.generateArchetypeWithLLM(answers);
        generatedArchetype = out.archetype;
        finalPrompt = out.prompt;
      } catch (llmErr) {
        // fallback to local mapping
        generatedArchetype = deriveArchetype(answers);
      }

      const res = await generateSticker(generatedArchetype, maybeSelfie, finalPrompt);
      setResult(res);
      setStep(STEPS.Result);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
      setStep(STEPS.Photo);
    }
  };

  const restart = () => {
    setStep(STEPS.Splash);
    setAnswers({});
    setQuestionIndex(0);
    setError(null);
    setResult(null);
  };

  return (
    <div className="app-root">
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {step === STEPS.Splash && <SplashScreen onStart={() => setStep(STEPS.Questions)} />}
      {step === STEPS.Questions && (
        <QuestionScreen
          question={currentQuestion}
          selected={answers[currentQuestion.id]}
          onSelect={handleSelect}
          onNext={handleNext}
          step={questionIndex + 1}
          total={total}
        />
      )}
      {step === STEPS.Photo && (
        <PhotoCapture onConfirm={startGeneration} onSkip={() => startGeneration(undefined)} />
      )}
      {step === STEPS.Generating && <LoadingScreen />}
      {step === STEPS.Result && result && <ResultScreen result={result} onRestart={restart} />}
    </div>
  );
}

export default App;
