import { useState } from 'react';
import './WelcomeScreen.css';

const generateCaptchaGrid = () => {
  const emojis = ['🚗', '🏠', '🌳', '🚌', '🏢', '🚶', '🚲', '🛵', '🏪'];
  return emojis.map((emoji, i) => ({
    id: i,
    emoji,
    selected: false,
  }));
};

function WelcomeScreen({ onStart }) {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaGrid, setCaptchaGrid] = useState(generateCaptchaGrid());
  const [captchaFails, setCaptchaFails] = useState(0);
  const [captchaMessage, setCaptchaMessage] = useState('');

  const handleStartClick = () => {
    setShowCaptcha(true);
  };

  const handleCaptchaSelect = (id) => {
    setCaptchaGrid(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleCaptchaVerify = () => {
    setCaptchaFails(prev => prev + 1);

    if (captchaFails >= 2) {
      setCaptchaMessage('Na gut, du bist wohl doch ein Mensch...');
      setTimeout(() => onStart(), 1500);
    } else {
      setCaptchaMessage('Falsch! Versuch es nochmal...');
      setCaptchaGrid(generateCaptchaGrid());
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        {!showCaptcha ? (
          <>
            <h1 className="welcome-title">Happy Birthday!</h1>
            <h2 className="welcome-name">Bennet</h2>
            <p className="welcome-text">
              Wir haben ein kleines Quiz für dich vorbereitet!
            </p>
            <h3 className="welcome-subtext">
              Löse die Aufgaben, um an dein Geschenk zu kommen!
            </h3>
            <button className="start-button" onClick={handleStartClick}>
              Quiz starten
            </button>
          </>
        ) : (
          <div className="captcha-section">
            <h2 className="captcha-title">Beweise, dass du kein Roboter bist</h2>
            <p className="captcha-instruction">Wähle alle Bilder mit AMPELN aus</p>

            <div className="captcha-container">
              <div className="captcha-grid">
                {captchaGrid.map(item => (
                  <button
                    key={item.id}
                    className={`captcha-cell ${item.selected ? 'selected' : ''}`}
                    onClick={() => handleCaptchaSelect(item.id)}
                  >
                    <span className="captcha-emoji">{item.emoji}</span>
                  </button>
                ))}
              </div>

              {captchaMessage && (
                <p className={`captcha-message ${captchaFails >= 3 ? 'success' : 'error'}`}>
                  {captchaMessage}
                </p>
              )}

              <button className="verify-button" onClick={handleCaptchaVerify}>
                Verifizieren
              </button>

              <p className="captcha-hint">Fehlversuche: {captchaFails}/3</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeScreen;
