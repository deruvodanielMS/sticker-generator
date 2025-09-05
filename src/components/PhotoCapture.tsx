import { useRef, useState } from 'react';

type Props = {
  onConfirm: (dataUrl?: string) => void;
  onSkip: () => void;
};

export default function PhotoCapture({ onConfirm, onSkip }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result ?? '');
        setSnapshot(dataUrl);
      };
      reader.onerror = () => setError('Failed to read the image file');
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Could not load image');
    }
  };

  const triggerCamera = () => {
    setError(null);
    if (inputRef.current) inputRef.current.click();
  };

  const retake = () => {
    setSnapshot(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const confirm = () => onConfirm(snapshot ?? undefined);

  return (
    <div className="screen-container">
      <h2 className="question-title">Personalize your robot?</h2>
      <p className="intro-copy">Optionally take a selfie to inspire the robot’s features. Use your device camera or choose an existing photo.</p>

      {error && <div className="error-banner">{error}</div>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      {!snapshot && (
        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
          <button className="primary-button" onClick={triggerCamera}>Take photo</button>
          <button className="ghost-button" onClick={onSkip}>Skip</button>
        </div>
      )}

      {snapshot && (
        <div className="photo-preview">
          <img src={snapshot} alt="Selfie preview" />
        </div>
      )}

      <div className="actions-row" style={{ width: '100%', justifyContent: 'center' }}>
        {snapshot ? (
          <>
            <button className="secondary-button" onClick={retake}>Retake</button>
            <button className="primary-button" onClick={confirm}>Continue</button>
          </>
        ) : null}
      </div>
    </div>
  );
}
