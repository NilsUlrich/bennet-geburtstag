import { useState, useEffect } from 'react';
import { gift } from '../data/quizData';
import './GiftReveal.css';

function GiftReveal({ score, totalQuestions }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="gift-screen">
      <div className={`gift-content ${revealed ? 'revealed' : ''}`}>
        <div className="score-section">
          <h3 className="score-label">Dein Ergebnis</h3>
          <div className="score-display">
            {score} / {totalQuestions}
          </div>
          <p className="score-text">
            {score === totalQuestions
              ? 'Perfekt! Du kennst deine Freunde wirklich gut!'
              : score >= totalQuestions / 2
              ? 'Nicht schlecht! Du kennst uns ganz gut!'
              : 'Naja, da geht noch was... Aber das ist okay!'}
          </p>
        </div>

        <div className="gift-box">
          <div className="gift-icon">🎁</div>
          <h1 className="gift-title">{gift.title}</h1>
          <h2 className="gift-subtitle">{gift.subtitle}</h2>

          <div className="voucher">
            <div className="voucher-icon">🧖‍♂️</div>
            <p className="voucher-description">{gift.description}</p>
            <p className="voucher-details">{gift.details}</p>
          </div>

          <div className="confetti">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ec4899'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </div>
        </div>

        <p className="signature">Mit Liebe von deinen Freunden ❤️</p>
      </div>
    </div>
  );
}

export default GiftReveal;
