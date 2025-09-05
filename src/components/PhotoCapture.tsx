import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

type Props = {
  onConfirm: (dataUrl?: string) => void;
  onSkip: () => void;
};

export default function PhotoCapture({ onConfirm, onSkip }: Props) {
  const webcamRef = useRef<Webcam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 1280 },
    facingMode: 'user',
  };

  useEffect(() => {
    return () => {
      // cleanup if unmounted
      setCameraStarted(false);
    };
  }, []);

  const startCamera = useCallback(() => {
    setError(null);
    setCameraStarted(true);
  }, []);

  const stopCamera = useCallback(() => {
    setCameraStarted(false);
  }, []);

  const takePhoto = useCallback(() => {
    setError(null);
    setLoading(true);
    try {
      const imageSrc = webcamRef.current?.getScreenshot({ width: 1024, height: 1024 }) ?? null;
      if (!imageSrc) {
        setError('Failed to capture photo. Please try again.');
        setLoading(false);
        return;
      }
      setSnapshot(imageSrc);
    } catch (e) {
      setError('Capture failed');
    } finally {
      setLoading(false);
      // stop camera feed to save resources
      setCameraStarted(false);
    }
  }, []);

  const confirm = () => onConfirm(snapshot ?? undefined);
  const retake = () => {
    setSnapshot(null);
    setError(null);
    setCameraStarted(true);
  };

  return (
    <div className="screen-container" role="region" aria-label="photo-capture">
      <h2 className="question-title">Personalize your robot?</h2>
      <p className="intro-copy">Optionally take a selfie to inspire the robot’s features. Use your device camera or choose an existing photo.</p>

      {error && <div className="error-banner" role="alert">{error}</div>}

      {!snapshot && !cameraStarted && (
        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
          <button className="primary-button" onClick={startCamera} aria-label="Start camera">Open camera</button>
          <button className="ghost-button" onClick={onSkip} aria-label="Skip photo">Skip</button>
        </div>
      )}

      {cameraStarted && !snapshot && (
        <div className="camera-frame">
          <Webcam
            audio={false}
            ref={webcamRef}
            mirrored
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="camera-video"
          />
          <div className="camera-overlay" />
        </div>
      )}

      {snapshot && (
        <div className="photo-preview">
          <img src={snapshot} alt="Selfie preview" />
        </div>
      )}

      <div className="actions-row" style={{ width: '100%', justifyContent: 'center' }}>
        {!snapshot && cameraStarted ? (
          <>
            <button className="primary-button" onClick={takePhoto} aria-label="Take photo">Take photo</button>
            <button className="ghost-button" onClick={stopCamera} aria-label="Close camera">Close</button>
          </>
        ) : snapshot ? (
          <>
            <button className="secondary-button" onClick={retake} aria-label="Retake photo">Retake</button>
            <button className="primary-button" onClick={confirm} aria-label="Use photo">Use photo</button>
          </>
        ) : null}
      </div>
    </div>
  );
}
