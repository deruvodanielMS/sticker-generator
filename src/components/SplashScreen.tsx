import type { FC } from 'react';

type Props = { onStart: () => void };

// Logos provided by the user
const LOGO_LIGHT = 'https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F361d511becfe4af99cffd14033941816?format=webp&width=800';
const LOGO_DARK = 'https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F8a91974e9a9e4d5399b528034240d956?format=webp&width=800';

const SplashScreen: FC<Props> = ({ onStart }) => {
  return (
    <div className="screen-container">
      <div className="brand-header">
        <h1 className="brand-title">Making Sense
          <span className="brand-sub">AI Archetype Sticker</span>
        </h1>
      </div>
      <p className="intro-copy">Discover your AI archetype. Answer 5 quick questions and get your exclusive sticker.</p>
      <button className="primary-button" onClick={onStart}>
        Start
      </button>
      <p className="privacy-note">No data is stored after printing. Internet connection required.</p>
    </div>
  );
};

export default SplashScreen;
