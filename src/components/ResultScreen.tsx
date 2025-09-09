import type { GenerationResult } from '../types';
import styles from './ResultScreen.module.css';
import Button from './ui/Button';
import { FC, useEffect, useState } from 'react';

type Props = {
  result: GenerationResult;
  userName?: string;
  userEmail?: string;
  onShare: () => void;
  onPrint: () => void;
};

const ResultScreen: FC<Props> = ({ result, userName, onShare, onPrint }) => {
  const { archetype, imageUrl } = result as any;
  // Prefer SVG frame asset for crisp rendering (use provided uploaded SVG if available)
  const FRAME_URL = "https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F5505fb97c053430187064b5c6e31e0b3?format=webp&width=800";

  // Choose sticker source (prefer server-provided full image URL or data URL)
  const stickerSource = (result as any)?.imageDataUrl || imageUrl;

  // Local preview composed at higher resolution to avoid pixelation in the UI
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // Helper: load image with crossOrigin and return HTMLImageElement
  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });

  // Helper: proxy frame to dataUrl to avoid CORS issues when composing
  const proxyFrame = async () => {
    try {
      const proxyResp = await fetch('/api/proxy-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-source': 'ui' },
        body: JSON.stringify({ url: FRAME_URL }),
      });
      if (proxyResp.ok) {
        const pj = await proxyResp.json();
        if (pj?.dataUrl) return pj.dataUrl;
      }
    } catch (e) {
      // ignore
    }
    return FRAME_URL;
  };

  // Compose sticker+frame at original sticker resolution for printing/sharing
  const providerError = (result as any)?.providerError || null;

  const composeStickerWithFrame = async (targetSizeOverride?: number): Promise<string> => {
    if (!stickerSource) return '';
    try {
      const proxiedFrameSrc = await proxyFrame();
      const [stickerImg, frameImg] = await Promise.all([loadImage(stickerSource), loadImage(proxiedFrameSrc)]);
      const canvas = document.createElement('canvas');

      // Make output square to avoid rounded empty corners inside the overlay
      const srcW = stickerImg.naturalWidth || stickerImg.width || 1024;
      const srcH = stickerImg.naturalHeight || stickerImg.height || 1024;
      const baseSize = Math.max(srcW, srcH);
      const size = targetSizeOverride ? Math.max(targetSizeOverride, baseSize) : baseSize;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');

      // Enable high quality resizing
      ctx.imageSmoothingEnabled = true;
      // @ts-ignore
      ctx.imageSmoothingQuality = 'high';

      // Draw sticker using cover strategy so it fills the square canvas completely
      const stickerScale = Math.max(size / srcW, size / srcH) * 1.05; // small overshoot to avoid gaps
      const drawW = srcW * stickerScale;
      const drawH = srcH * stickerScale;
      const dx = (size - drawW) / 2;
      const dy = (size - drawH) / 2;

      // Fill background with white to hide any rounded/transparency in generated sticker (prevents visible gaps)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Draw the sticker centered and scaled to cover the square canvas
      ctx.drawImage(stickerImg, dx, dy, drawW, drawH);

      // Draw frame on top, scaled to COVER canvas (like background-size: cover)
      const ovW = frameImg.naturalWidth || frameImg.width || size;
      const ovH = frameImg.naturalHeight || frameImg.height || size;
      const safeOvW = ovW > 0 ? ovW : size;
      const safeOvH = ovH > 0 ? ovH : size;

      const frameScale = Math.max(size / safeOvW, size / safeOvH) * 1.05; // ensure overlay slightly larger
      const frameDrawW = safeOvW * frameScale;
      const frameDrawH = safeOvH * frameScale;
      const fdx = (size - frameDrawW) / 2;
      const fdy = (size - frameDrawH) / 2;

      ctx.drawImage(frameImg, fdx, fdy, frameDrawW, frameDrawH);

      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('Failed to compose sticker for export', e);
      return stickerSource as string;
    }
  };

  // Build a high-quality preview for the UI to avoid visible pixelation
  useEffect(() => {
    let mounted = true;
    if (!stickerSource) {
      setPreviewSrc(null);
      return;
    }

    (async () => {
      try {
        // create a preview sized for UI but high enough to avoid pixelation
        const targetPreviewSize = 1024; // fixed preview size for crispness
        const composed = await composeStickerWithFrame(targetPreviewSize);
        if (mounted) setPreviewSrc(composed);
      } catch (e) {
        // fall back to raw sticker
        if (mounted) setPreviewSrc(null);
      }
    })();

    return () => { mounted = false; };
  }, [stickerSource]);

  const printSticker = async () => {
    const w = window.open('', '_blank');
    if (!w) {
      onPrint();
      return;
    }
    let outSrc = previewSrc || stickerSource || FRAME_URL;
    try {
      outSrc = await composeStickerWithFrame();
    } catch (e) {
      outSrc = previewSrc || stickerSource || FRAME_URL;
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
        const res = await fetch(stickerSource as string);
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

  return (
    <div className={styles.resultScreen}>

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

        {/* Sticker displayed as composed preview when available. Frame is incorporated into the preview to avoid CSS overlay pixelation. */}
        <div className={styles.stickerRawContainer}>
          <img src={previewSrc || stickerSource || FRAME_URL} alt="Sticker" className={styles.stickerRawImg} />
          {/* If preview is not available, keep the frame overlay for visual fidelity */}
          {!previewSrc && <img src={FRAME_URL} alt="Frame overlay" className={styles.stickerFrameOverlay} />}
        </div>

        <div className={styles.resultButtons}>
          <Button variant="primary" onClick={printSticker}>
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F1146f9e4771b4cff95e916ed9381032d?format=svg" alt="Print" className={styles.resultButtonIcon} />
            PRINT
          </Button>
        </div>

        <div className={styles.resultEmail}>
        </div>
      </div>

    </div>
  );
};

export default ResultScreen;
