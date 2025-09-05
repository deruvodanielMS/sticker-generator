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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12.2696 1.5 12.5278 1.60886 12.716 1.8019L16.466 5.64805C16.8516 6.04349 16.8435 6.6766 16.4481 7.06215C16.0527 7.4477 15.4195 7.43969 15.034 7.04425L13 4.9581V13.5C13 14.0523 12.5523 14.5 12 14.5C11.4477 14.5 11 14.0523 11 13.5V4.9581L8.966 7.04425C8.58045 7.43969 7.94734 7.4477 7.5519 7.06215C7.15646 6.6766 7.14845 6.04349 7.534 5.64805L11.284 1.8019C11.4722 1.60886 11.7304 1.5 12 1.5ZM6.375 11C6.15122 11 5.93133 11.0909 5.76517 11.2614C5.59818 11.4326 5.5 11.6702 5.5 11.9231V19.5769C5.5 19.8298 5.59818 20.0674 5.76517 20.2386C5.93133 20.4091 6.15122 20.5 6.375 20.5H17.625C17.8488 20.5 18.0687 20.4091 18.2348 20.2386C18.4018 20.0674 18.5 19.8298 18.5 19.5769V11.9231C18.5 11.6702 18.4018 11.4326 18.2348 11.2614C18.0687 11.0909 17.8488 11 17.625 11H15.75C15.1977 11 14.75 10.5523 14.75 10C14.75 9.44772 15.1977 9 15.75 9H17.625C18.3958 9 19.1297 9.31428 19.6668 9.86516C20.2031 10.4152 20.5 11.1559 20.5 11.9231V19.5769C20.5 20.3441 20.2031 21.0848 19.6668 21.6348C19.1297 22.1857 18.3958 22.5 17.625 22.5H6.375C5.60421 22.5 4.87028 22.1857 4.33317 21.6348C3.79691 21.0848 3.5 20.3441 3.5 19.5769V11.9231C3.5 11.1559 3.79691 10.4152 4.33317 9.86516C4.87028 9.31428 5.60422 9 6.375 9H8.25C8.80228 9 9.25 9.44772 9.25 10C9.25 10.5523 8.80228 11 8.25 11H6.375Z" fill="#102532"/>
            </svg>
            SHARE
          </button>
          
          <button className="result-button primary" onClick={printSticker}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 14H6V22H18V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            PRINT
          </button>
        </div>

        <button className="result-start-over" onClick={onRestart}>
          START OVER
        </button>
      </div>

      {/* Debug info - hidden by default */}
      {(source === 'fallback' || providerError) && (
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
