import type { GenerationResult } from '../types';
import styles from './ResultScreen.module.css';
import Button from './ui/Button';
import { useEffect } from 'react';
import type { FC } from 'react';

type Props = {
  result: GenerationResult;
  userName?: string;
  userEmail?: string;
  onShare: () => void;
  onPrint: () => void;
  onRestart?: () => void;
};

const ResultScreen: FC<Props> = ({ result, userName, userEmail, onShare, onPrint, onRestart }) => {
  const { archetype, imageUrl } = result as any;
  // Use the frame URL directly - no complex composition
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

  // Compose sticker for export (no frame overlay)
  const composeSticker = async (): Promise<string> => {
    if (!stickerSource) return '';
    try {
      const stickerImg = await loadImage(stickerSource);
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
    let outSrc = stickerSource;
    try {
      outSrc = await composeSticker();
    } catch (e) {
      outSrc = stickerSource;
    }

    w.document.write(`<html><head><title>${archetype.name} Sticker</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#fff;">
      <img src="${outSrc}" style="max-width:90vw;max-height:90vh;object-fit:contain;"/>
      <script>window.onload=function(){setTimeout(function(){window.print();}, 300)}<\/script>
    </body></html>`);
    w.document.close();
    setTimeout(() => onPrint(), 1000);
  };


  const providerError = (result as any)?.providerError || null;

  // Automatically POST the standardized payload directly to n8n webhook when the result screen mounts
  useEffect(() => {
    const sendToN8n = async () => {
      try {
        // Allow overriding via VITE_N8N_WEBHOOK_URL; default to the provided test endpoint
        let raw = (import.meta.env.VITE_N8N_WEBHOOK_URL as string) || 'https://nano-ms.app.n8n.cloud/webhook-test/sticker-app';
        raw = String(raw).trim();
        // Normalize repeated protocols (e.g. "https://https://...") and ensure a protocol exists
        raw = raw.replace(/^(https?:\/\/)+/i, '$1');
        const endpoint = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

        const payload = {
          email: userEmail || '',
          name: userName || '',
          timestamp: new Date().toISOString(),
          sticker: stickerSource || null,
          archetype: (result as any)?.archetype?.name || (result as any)?.archetype || null,
          survey: {}
        };

        console.log('Posting payload to n8n webhook:', endpoint, payload);

        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          mode: 'cors'
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          console.warn('n8n webhook returned non-OK status', resp.status, resp.statusText, text);
        } else {
          console.log('n8n webhook posted successfully');
        }
      } catch (e) {
        console.error('Failed to post to n8n webhook:', e);
      } finally {
        try { onShare(); } catch (err) { /* ignore */ }
      }
    };

    sendToN8n();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.resultContainer}>
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

        {/* Sticker display contained within a frame overlay */}
        <div className={styles.stickerContainer}>
          <div className={styles.stickerInner}>
            {stickerSource ? (
              <img src={stickerSource} alt="Sticker" className={styles.stickerImage} />
            ) : (
              <div className={styles.stickerPlaceholder} />
            )}
          </div>

          {/* Frame overlay (decorative) */}
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F22ecb8e2464b40dd8952c31710f2afe2?format=png&width=2000"
            srcSet="https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F22ecb8e2464b40dd8952c31710f2afe2?format=png&width=1000 1x, https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F22ecb8e2464b40dd8952c31710f2afe2?format=png&width=2000 2x"
            alt="frame"
            className={styles.frameOverlay}
            decoding="async"
          />
        </div>

        <div className={styles.resultButtons}>
          <Button variant="primary" onClick={printSticker}>
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F1146f9e4771b4cff95e916ed9381032d?format=svg" alt="Print" className={styles.resultButtonIcon} />
            PRINT
          </Button>
        </div>

        <div className={styles.startOverSection}>
          <Button variant="text" onClick={onRestart || (() => window.location.reload())}>
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
