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
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

        // Proxy the frame image to a data URL to avoid CORS issues and allow safe canvas composition
        let proxiedFrameSrc = FRAME_URL;
        try {
          const proxyResp = await fetch('/api/proxy-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-source': 'ui' },
            body: JSON.stringify({ url: FRAME_URL }),
          });
          if (proxyResp.ok) {
            const pj = await proxyResp.json();
            if (pj?.dataUrl) proxiedFrameSrc = pj.dataUrl;
          }
        } catch (e) {
          // fallback to FRAME_URL on failure
        }

        const [frameImg, stickerImg] = await Promise.all([loadImg(proxiedFrameSrc), loadImg(imageUrl)]);

        // Use frame dimensions as canvas size
        const canvas = document.createElement('canvas');
        const canvasW = frameImg.naturalWidth || frameImg.width || 1024;
        const canvasH = frameImg.naturalHeight || frameImg.height || 1024;
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw frame first as background
        ctx.drawImage(frameImg, 0, 0, canvasW, canvasH);

        // Compute inner square area where sticker should be drawn
        const paddingPercent = 0.12;
        const padding = Math.round(canvasW * paddingPercent);
        const bw = canvasW - padding * 2;
        const bh = canvasH - padding * 2;
        const boxSide = Math.min(bw, bh);
        const bxCenter = Math.floor((canvasW - boxSide) / 2);
        const byCenter = Math.floor((canvasH - boxSide) / 2);

        // Draw white background inside box
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bxCenter, byCenter, boxSide, boxSide);

        // Crop sticker to centered square and draw into box
        const sW = stickerImg.naturalWidth || stickerImg.width;
        const sH = stickerImg.naturalHeight || stickerImg.height;
        const sSide = Math.min(sW, sH);
        const sx = Math.floor((sW - sSide) / 2);
        const sy = Math.floor((sH - sSide) / 2);
        ctx.drawImage(stickerImg, sx, sy, sSide, sSide, bxCenter, byCenter, boxSide, boxSide);

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

        {/* Archetype label layer (text) */}
        <div className="archetype-label">{archetype?.name}</div>

        {/* Frame image (the frame contains the site url visually) */}
        <div className="frame-only">
          <img src={FRAME_URL} alt="Frame" className="frame-image" />
        </div>

        {/* Sticker result shown below the frame */}
        <div className="result-image-container">
          <img src={(result as any)?.imageDataUrl || composedUrl || imageUrl} alt={`${archetype.name} sticker`} className="result-image" />
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
