import type { FC } from 'react';
import type { GenerationResult } from '../types';

type Props = {
  result: GenerationResult;
  onRestart: () => void;
};

const ResultScreen: FC<Props> = ({ result, onRestart }) => {
  const { archetype, imageUrl, prompt, source, providerError } = result;

  const printSticker = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${archetype.name} Sticker</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#fff;">
      <img src="${imageUrl}" style="width:80vmin;height:80vmin;object-fit:contain;"/>
      <script>window.onload=function(){setTimeout(function(){window.print();}, 300)}<\/script>
    </body></html>`);
    w.document.close();
  };

  const shareSticker = async () => {
    const fileName = `${archetype.name.replace(/\s+/g, '-')}-sticker.png`;
    try {
      const blob = await (await fetch(imageUrl)).blob();
      if (navigator.share && (navigator as any).canShare?.({ files: [new File([blob], fileName, { type: blob.type })] })) {
        await navigator.share({
          title: `${archetype.name} Sticker`,
          text: archetype.valueLine,
          files: [new File([blob], fileName, { type: blob.type })],
        });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch {
      // no-op
    }
  };

  return (
    <div className="result-screen">
      {/* Decorative background elements */}
      <div className="result-decoratives">
        <div className="result-shape result-shape-1"></div>
        <div className="result-shape result-shape-2"></div>
        <div className="result-shape result-shape-3"></div>
      </div>

      <div className="result-section">
        <h1 className="result-title">You are {archetype.name}!</h1>
        
        <div className="result-divider">
          <div className="divider-line"></div>
          <svg width="5" height="4" viewBox="0 0 5 4" fill="none" xmlns="http://www.w3.org/2000/svg" className="divider-dot">
            <circle cx="2.5" cy="2" r="2" fill="url(#paint0_linear)"/>
            <defs>
              <linearGradient id="paint0_linear" x1="0.688744" y1="1.47298" x2="2.12203" y2="3.02577" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1EDD8E"/>
                <stop offset="1" stopColor="#53C0D2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="result-description">
          <p className="result-line-1">{archetype.descriptor}</p>
          <p className="result-line-2">{archetype.valueLine}</p>
        </div>
        
        <div className="result-image-container">
          <img src={imageUrl} alt={`${archetype.name} sticker`} className="result-image" />
        </div>
        
        <div className="result-buttons">
          <button className="result-button secondary" onClick={shareSticker}>
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2Fb2c3e6f19434464292c37a48e9e419e9?format=webp&width=800" alt="Share" className="result-button-icon" />
            SHARE
          </button>

          <button className="result-button primary" onClick={printSticker}>
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F4c9c25e7ce8049fab890b8f854c5e28e?format=webp&width=800" alt="Print" className="result-button-icon" />
            PRINT
          </button>
        </div>

        <button className="result-start-over" onClick={onRestart}>
          START OVER
        </button>
      </div>

      {/* Debug info - hidden in production */}
      {false && (source === 'fallback' || providerError) && (
        <div className="result-debug">
          <div className="debug-info">
            <strong>Debug:</strong> {source} {providerError && `- ${providerError}`}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultScreen;
