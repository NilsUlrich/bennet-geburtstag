import { useEffect, useMemo, useState } from 'react';
import { memoryImages } from '../data/memoryImages';
import './MemoryGame.css';

// Use friendly emoji pairs for a zero-asset game
const EMOJI_SET = ['🎂', '🎈', '🎁', '🎉', '🍰', '🍾', '🍬', '🎮'];

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createDeck(size = 8) {
  const images = (memoryImages || []).slice(0, size);
  if (images.length === size) {
    const pairs = images.flatMap((url, idx) => [
      { id: `${idx}-a`, key: `${idx}`, img: url },
      { id: `${idx}-b`, key: `${idx}`, img: url },
    ]);
    return shuffle(pairs);
  }
  // Fallback: Emojis
  const base = EMOJI_SET.slice(0, size);
  const pairs = base.flatMap((emoji, idx) => [
    { id: `${idx}-a`, key: `${idx}`, emoji },
    { id: `${idx}-b`, key: `${idx}`, emoji },
  ]);
  return shuffle(pairs);
}

export default function MemoryGame({ onComplete, gridPairs = 8 }) {
  const maxPairs = Math.min(gridPairs, Math.max(EMOJI_SET.length, (memoryImages || []).length));
  const deck = useMemo(() => createDeck(maxPairs), [maxPairs]);
  const [cards, setCards] = useState(deck);
  const [flipped, setFlipped] = useState([]); // store ids
  const [matchedKeys, setMatchedKeys] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [brokenImages, setBrokenImages] = useState(new Set());

  // simple timer
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // reset if gridPairs changes
  useEffect(() => {
    setCards(deck);
    setFlipped([]);
    setMatchedKeys(new Set());
    setMoves(0);
    setSeconds(0);
    setIsLocked(false);
  }, [deck]);

  const handleFlip = (id) => {
    if (isLocked) return;
    const alreadyFlipped = flipped.includes(id);
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    if (matchedKeys.has(card.key)) return;
    if (alreadyFlipped) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);
      const [id1, id2] = newFlipped;
      const c1 = cards.find((c) => c.id === id1);
      const c2 = cards.find((c) => c.id === id2);

      const isMatch = c1 && c2 && c1.key === c2.key;
      setTimeout(() => {
        if (isMatch) {
          const newSet = new Set(matchedKeys);
          newSet.add(c1.key);
          setMatchedKeys(newSet);
          setFlipped([]);
        } else {
          setFlipped([]);
        }
        setIsLocked(false);
      }, isMatch ? 350 : 700);
    }
  };

  const allMatched = matchedKeys.size === maxPairs;

  useEffect(() => {
    if (allMatched) {
      // tiny delay for last animation
      const t = setTimeout(() => {
        onComplete && onComplete();
      }, 900);
      return () => clearTimeout(t);
    }
  }, [allMatched, onComplete]);

  const handleRestart = () => {
    const fresh = createDeck(Math.min(gridPairs, EMOJI_SET.length));
    setCards(fresh);
    setFlipped([]);
    setMatchedKeys(new Set());
    setMoves(0);
    setSeconds(0);
    setIsLocked(false);
  };

  return (
    <div className="memory-screen">
      <div className="memory-header">
        <h2 className="memory-title">Mini‑Game: Memory</h2>
        <div className="memory-stats">
          <span className="stat">Züge: {moves}</span>
          <span className="stat">Zeit: {seconds}s</span>
        </div>
        <div className="memory-actions">
          <button className="restart-button" onClick={handleRestart}>Neu mischen</button>
        </div>
      </div>

      <div className={`memory-grid pairs-${maxPairs}`}>
        {cards.map((card) => {
          const isFaceUp = flipped.includes(card.id) || matchedKeys.has(card.key);
          return (
            <button
              key={card.id}
              className={`memory-card ${isFaceUp ? 'flipped' : ''}`}
              onClick={() => handleFlip(card.id)}
              aria-label="Karte umdrehen"
            >
              <div className="card-inner">
                <div className="card-front">❓</div>
                <div className="card-back">
                  {card.img && !brokenImages.has(card.img) ? (
                    <img
                      className="card-image"
                      src={card.img}
                      alt="Memory Motiv"
                      onError={() => setBrokenImages((prev) => new Set(prev).add(card.img))}
                    />
                  ) : (
                    <span>{card.emoji ?? '🎁'}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {allMatched && (
        <div className="memory-finish">
          <div className="finish-card">
            <div className="finish-emoji">🎉</div>
            <p className="finish-text">Geschafft! Weiter geht's…</p>
          </div>
        </div>
      )}
    </div>
  );
}
