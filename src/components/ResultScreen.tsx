import React, { useState } from 'react';
import type { FC } from 'react';
import type { GenerationResult } from '../types';

type Props = {
  result: GenerationResult;
  userName?: string;
  userEmail?: string;
  onRestart: () => void;
};

const ResultScreen: FC<Props> = ({ result, userName, userEmail, onRestart }) => {
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

  const [emailState, setEmailState] = useState<string>((userEmail as string) || '');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<boolean | null>(null);

  const sendByEmail = async () => {
    if (!emailState || !/[^@\s]+@[^@\s]+\.[^@\s]+/.test(emailState)) {
      setSendSuccess(false);
      return;
    }
    setSending(true);
    setSendSuccess(null);
    try {
      const resp = await fetch('/api/send-sticker-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailState,
          subject: `${archetype.name} Sticker for ${userName || 'you'}`,
          text: archetype.valueLine,
          imageUrl,
        }),
      });
      const json = await resp.json();
      if (json && json.success) setSendSuccess(true);
      else setSendSuccess(false);
    } catch (e) {
      setSendSuccess(false);
    } finally {
      setSending(false);
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
          {userName && <p className="result-user">Thanks, <strong>{userName}</strong></p>}
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

        <div className="result-email">
          <input
            type="email"
            className="result-email-input"
            placeholder="Send to email"
            value={emailState}
            onChange={(e) => setEmailState(e.target.value)}
          />
          <button className="result-button tertiary" onClick={sendByEmail} disabled={sending}>
            {sending ? 'SENDING…' : 'EMAIL'}
          </button>
          {sendSuccess === true && <div className="email-success">Sent!</div>}
          {sendSuccess === false && <div className="email-error">Failed to send</div>}
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
