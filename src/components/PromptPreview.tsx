import { useState } from 'react';
import React, { useState } from 'react';
import type { Archetype } from '../types';
import tokens from '../styles/tokens.module.css';
import Button from './ui/Button';

type Props = {
  archetype: Archetype;
  prompt: string;
  onChange: (newPrompt: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  loading?: boolean;
};

export default function PromptPreview({ archetype, prompt, onChange, onGenerate, onRegenerate, loading }: Props) {
  const [local, setLocal] = useState(prompt);

  return (
    <div className={`${tokens.container}`}>
      <h2 className={`${tokens.title}`}>Prompt preview</h2>
      <p className={`${tokens.subtle}`}>Review or tweak the prompt that will be sent to the image generator.</p>

      <div className="" style={{ width: '100%' }}>
        <div className={`${tokens.textCenter}`} style={{ marginBottom: 8 }}>
          <strong style={{ color: 'var(--gradient1-textContrast)' }}>{archetype.name}</strong>
          <div className={`${tokens.subtle}`}>{archetype.descriptor}</div>
        </div>

        <textarea
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => onChange(local)}
          rows={8}
          className={tokens.textarea}
        />
      </div>

      <div className={tokens.actionsRow}>
        <Button variant="secondary" onClick={() => { setLocal(prompt); onChange(prompt); }} disabled={loading}>Reset</Button>
        <Button variant="ghost" onClick={onRegenerate} disabled={loading}>Regenerate Prompt</Button>
        <Button variant="primary" onClick={onGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate Image'}</Button>
      </div>

      <p className="privacy-note">You can edit the prompt to adjust style or remove personal references. Changes are not stored.</p>
    </div>
  );
}
