import { useEffect, useRef, useState } from 'react';

type Props = {
  onConfirm: (dataUrl?: string) => void;
  onSkip: () => void;
};

export default function PhotoCapture({ onConfirm, onSkip }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        setError('Camera access denied or unavailable.');
      }
    }
    init();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 480);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, size, size);
    const data = canvas.toDataURL('image/png');
    setSnapshot(data);
  };

  const confirm = () => onConfirm(snapshot ?? undefined);

  return (
    <div className="screen-container">
      <h2 className="question-title">Personalize your robot?</h2>
      <p className="intro-copy">Optionally take a selfie to inspire the robot’s features.</p>

      {error && <div className="error-banner">{error}</div>}

      {!snapshot ? (
        <div className="camera-frame">
          <video ref={videoRef} playsInline className="camera-video" />
          <div className="camera-overlay" />
        </div>
      ) : (
        <div className="photo-preview">
          <img src={snapshot} alt="Selfie preview" />
        </div>
      )}

      <div className="actions-row">
        {!snapshot ? (
          <button className="primary-button" onClick={takePhoto} disabled={!!error}>Take photo</button>
        ) : (
          <button className="secondary-button" onClick={() => setSnapshot(null)}>Retake</button>
        )}
        <button className="ghost-button" onClick={onSkip}>Skip</button>
        <button className="primary-button" onClick={confirm}>Continue</button>
      </div>
    </div>
  );
}
