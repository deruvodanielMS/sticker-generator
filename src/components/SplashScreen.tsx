type Props = { onStart: () => void };

const SplashScreen = ({ onStart }: Props) => {
  return (
    <div className="welcome-screen">
      <div className="hero-section">
        <h1 className="hero-title">
          Find Your AI Agent
        </h1>

        <div className="hero-divider">
          <div className="divider-line"></div>
          <div className="divider-dot"></div>
        </div>

        <p className="hero-description">
          Uncover the digital ally that thinks like you, moves with you, and amplifies your every decision.<br /><br />
          In the fast pace of Private Equity, every choice shapes the future. Let your AI Agent be the silent partner that turns instinct into insight, and vision into value.
        </p>

        <button className="hero-button" onClick={onStart}>
          LET'S START
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
