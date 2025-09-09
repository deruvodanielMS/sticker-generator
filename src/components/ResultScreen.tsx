import type { GenerationResult } from '../types';
import styles from './ResultScreen.module.css';
import Button from './ui/Button';
import { FC } from 'react';

type Props = {
  result: GenerationResult;
  userName?: string;
  userEmail?: string;
  onShare: () => void;
  onPrint: () => void;
};

const ResultScreen: FC<Props> = ({ result, userName, onShare, onPrint }) => {
  const { archetype, imageUrl } = result as any;
  // Use the frame URL directly - no complex composition
  const FRAME_URL = "https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F5505fb97c053430187064b5c6e31e0b3?format=webp&width=800";

  // Choose sticker source (prefer server-provided full image URL or data URL)
  const stickerSource = (result as any)?.imageDataUrl || imageUrl;

  // Helper: load image with crossOrigin and return HTMLImageElement
  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });

  // Simple composition for print/share only
  const composeStickerWithFrame = async (): Promise<string> => {
    if (!stickerSource) return '';
    try {
      const [stickerImg, frameImg] = await Promise.all([loadImage(stickerSource), loadImage(FRAME_URL)]);
      const canvas = document.createElement('canvas');
      const size = 1024; // Fixed high resolution
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Draw sticker to fill canvas
      ctx.drawImage(stickerImg, 0, 0, size, size);

      // Draw frame on top
      ctx.drawImage(frameImg, 0, 0, size, size);

      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('Failed to compose sticker for export', e);
      return stickerSource;
    }
  };

  const printSticker = async () => {
    const w = window.open('', '_blank');
    if (!w) {
      onPrint();
      return;
    }
    let outSrc = stickerSource || FRAME_URL;
    try {
      outSrc = await composeStickerWithFrame();
    } catch (e) {
      outSrc = stickerSource || FRAME_URL;
    }

    w.document.write(`<html><head><title>${archetype.name} Sticker</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#fff;">
      <img src="${outSrc}" style="max-width:90vw;max-height:90vh;object-fit:contain;"/>
      <script>window.onload=function(){setTimeout(function(){window.print();}, 300)}<\/script>
    </body></html>`);
    w.document.close();
    setTimeout(() => onPrint(), 1000);
  };

  const shareSticker = async () => {
    const fileName = `${archetype.name.replace(/\s+/g, '-')}-sticker.png`;
    try {
      const composedDataUrl = await composeStickerWithFrame();
      const res = await fetch(composedDataUrl);
      const blob = await res.blob();
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
    } catch (e) {
      console.error('Share failed, falling back to raw sticker', e);
      try {
        const res = await fetch(stickerSource);
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
      } catch {}
    } finally {
      setTimeout(() => onShare(), 500);
    }
  };

  const providerError = (result as any)?.providerError || null;

  return (
    <div className="screen-container">
      <div className={styles.resultSection}>
        <h1 className={styles.resultTitle}>{userName ? `${userName}, you are a ${archetype.name}!` : `You are ${archetype.name}!`}</h1>

        <div className={styles.resultDivider}>
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

        <div className={styles.resultDescription}>
          <p className={styles.resultLine1}>{archetype.descriptor}</p>
          <p className={styles.resultLine2}>{archetype.valueLine}</p>
        </div>

        {providerError && (
          <div className={styles.resultProviderError}>Generation fallback used: {String(providerError)}</div>
        )}

        {/* Archetype label layer (text) */}
        <div className={styles.archetypeLabel}>{archetype?.name}</div>

        {/* Simple sticker display - raw sticker with frame overlay using CSS */}
        <div className={styles.stickerContainer}>
          <img src={stickerSource || FRAME_URL} alt="Sticker" className={styles.stickerImage} />
          <img src={FRAME_URL} alt="Frame overlay" className={styles.frameOverlay} />
        </div>

        <div className={styles.resultButtons}>
          <Button variant="primary" onClick={printSticker}>
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F1146f9e4771b4cff95e916ed9381032d?format=svg" alt="Print" className={styles.resultButtonIcon} />
            PRINT
          </Button>
        </div>

        <div className={styles.startOverSection}>
          <Button variant="text" onClick={() => window.location.reload()}>
            START OVER
          </Button>
        </div>

        <div className={styles.resultEmail}>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
