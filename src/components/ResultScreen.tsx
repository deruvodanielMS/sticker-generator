import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { GenerationResult } from '../types';

type Props = {
  result: GenerationResult;
  userName?: string;
  userEmail?: string;
  onShare: () => void;
  onPrint: () => void;
};

const ResultScreen: FC<Props> = ({ result, userName, userEmail, onShare, onPrint }) => {
  const { archetype, imageUrl, prompt, source, providerError } = result as any;
  const [composedUrl, setComposedUrl] = useState<string | null>(null);

  // Frame image to center sticker into (updated frame with extra space for overlay)
  const FRAME_URL = "https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F92f6eacc93034c8dae850519b88047aa?format=webp&width=800";

  // Compose the generated sticker centered into the frame
  useEffect(() => {
    let cancelled = false;
    async function compose() {
      try {
        if (!imageUrl) {
          setComposedUrl(null);
          return;
        }
        const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

        const [frameImg, stickerImg] = await Promise.all([loadImg(FRAME_URL), loadImg(imageUrl)]);

        // Use frame dimensions as canvas size
        const canvas = document.createElement('canvas');
        canvas.width = frameImg.naturalWidth || frameImg.width || 1024;
        canvas.height = frameImg.naturalHeight || frameImg.height || 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw sticker centered and sized to fit within 76% of the frame (keeps margins)
        const maxStickerSize = Math.min(canvas.width, canvas.height) * 0.76;

        // Crop sticker to a centered square from source
        const sW = stickerImg.naturalWidth || stickerImg.width;
        const sH = stickerImg.naturalHeight || stickerImg.height;
        const sSide = Math.min(sW, sH);
        const sx = Math.floor((sW - sSide) / 2);
        const sy = Math.floor((sH - sSide) / 2);

        // Destination size is square
        const drawW = maxStickerSize;
        const drawH = maxStickerSize;
        const dx = Math.floor((canvas.width - drawW) / 2);
        const dy = Math.floor((canvas.height - drawH) / 2 - (canvas.height * 0.03)); // slight upward nudge

        // Use a deterministic centered inner square area inside the frame
        const paddingPercent = 0.12; // inner padding from frame edges
        const padding = Math.round(canvas.width * paddingPercent);
        const bx = padding;
        const by = padding;
        const bw = canvas.width - padding * 2;
        const bh = canvas.height - padding * 2;

        // Ensure square box
        const boxSide = Math.min(bw, bh);
        const bxCenter = Math.floor((canvas.width - boxSide) / 2);
        const byCenter = Math.floor((canvas.height - boxSide) / 2);

        // Draw opaque background rectangle to ensure sticker appears square (hide any rounded alpha from image)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bxCenter, byCenter, boxSide, boxSide);

        // Draw sticker into the centered square (fill entirely)
        ctx.drawImage(stickerImg, sx, sy, sSide, sSide, bxCenter, byCenter, boxSide, boxSide);

        // Create a temporary canvas to modify frame alpha by clearing near-white pixels (make center transparent)
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        const tmpCtx = tmpCanvas.getContext('2d');
        if (!tmpCtx) throw new Error('Failed to create temp canvas context');
        tmpCtx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

        try {
          const frameData = tmpCtx.getImageData(0, 0, canvas.width, canvas.height);
          const threshold = 245; // near-white threshold
          for (let i = 0; i < frameData.data.length; i += 4) {
            const r = frameData.data[i];
            const g = frameData.data[i + 1];
            const b = frameData.data[i + 2];
            const a = frameData.data[i + 3];
            if (a > 200 && r >= threshold && g >= threshold && b >= threshold) {
              frameData.data[i + 3] = 0; // make pixel transparent
            }
          }
          tmpCtx.putImageData(frameData, 0, 0);
        } catch (e) {
          // getImageData may fail due to CORS; in that case, fallback to drawing frame as-is on top
          console.warn('Could not access frame pixel data (CORS?), drawing frame as-is', e);
        }

        // Draw modified frame (with transparent center where possible) on top
        ctx.drawImage(tmpCanvas, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        if (!cancelled) setComposedUrl(dataUrl);
      } catch (e) {
        console.error('Failed to compose sticker with frame', e);
        setComposedUrl(imageUrl);
      }
    }
    compose();
    return () => { cancelled = true; };
  }, [imageUrl]);

  const printSticker = () => {
    const w = window.open('', '_blank');
    if (!w) {
      onPrint(); // Navigate even if print fails
      return;
    }
    const outSrc = composedUrl || imageUrl;
    w.document.write(`<html><head><title>${archetype.name} Sticker</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#fff;">
      <img src="${outSrc}" style="width:80vmin;height:80vmin;object-fit:contain;"/>
      <script>window.onload=function(){setTimeout(function(){window.print();}, 300)}<\/script>
    </body></html>`);
    w.document.close();
    // Navigate to thank you after a short delay to allow print dialog
    setTimeout(() => onPrint(), 1000);
  };

  const shareSticker = async () => {
    const fileName = `${archetype.name.replace(/\s+/g, '-')}-sticker.png`;
    try {
      const outSrc = composedUrl || imageUrl;
      const blob = await (await fetch(outSrc)).blob();
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
    } finally {
      // Navigate to thank you after share attempt (success or failure)
      setTimeout(() => onShare(), 500);
    }
  };

  return (
    <div className="result-screen">

      <div className="result-section">
        <h1 className="result-title">{userName ? `${userName}, you are a ${archetype.name}!` : `You are ${archetype.name}!`}</h1>

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
          <img src={composedUrl || imageUrl} alt={`${archetype.name} sticker`} className="result-image" />
        </div>

        <div className="result-buttons">
          <button className="result-button secondary" onClick={shareSticker}>
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F46582c5b707c47f389cf1daf4acaea9d?format=svg" alt="Share" className="result-button-icon" />
            SHARE
          </button>

          <button className="result-button primary" onClick={printSticker}>
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F1146f9e4771b4cff95e916ed9381032d?format=svg" alt="Print" className="result-button-icon" />
            PRINT
          </button>
        </div>

        <div className="result-email">
        </div>
      </div>

    </div>
  );
};

export default ResultScreen;
