import { useState, useEffect, useRef, useCallback } from 'react';
import './ResultScreen.css';

const trollTypes = [
  'runaway',           // Button flüchtet, bleibt bei 5. Versuch kurz stehen und springt weg
  'loading-99',        // Ladebalken hängt bei 99%, geht dann bis 200%
  'fake-buttons',      // 10 Buttons, nur einer ist richtig
  'date-picker',       // Nerviges Datum aus 365 Tagen Dropdown auswählen
  'are-you-sure',      // Endlose "Bist du sicher?" Dialoge
  'ghost-clicks',      // Keine Reaktion, dann plötzlich weiter
];

const fakeButtonLabels = [
  'Weiter',
  'Nicht Abbrechen',
  'Vielleicht weiter',
  'Ok?',
  'Absenden (Nicht)',
  'Fortfahren??',
  'Hier klicken!',
  'Weiter →',
  '→ Weiter ←',
  'Submit',
];

// Generate all 365 days of 2025
const generateAllDays = () => {
  const days = [];
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  for (let m = 0; m < 12; m++) {
    for (let d = 1; d <= daysInMonth[m]; d++) {
      days.push({
        value: `${d}.${m + 1}.2025`,
        label: `${d}. ${months[m]} 2025`,
      });
    }
  }
  return days;
};

const allDays = generateAllDays();

function ResultScreen({ isCorrect, correctAnswer, friend, trollImage, onNext, questionNumber }) {
  const [trollType, setTrollType] = useState('');
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 50 });
  const [runawayAttempts, setRunawayAttempts] = useState(0);
  const [isPausing, setIsPausing] = useState(false);

  // Loading states - now goes to 200%
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [loadingPhase, setLoadingPhase] = useState(0); // 0: to 99, 1: stuck, 2: to 200, 3: done

  // Fake buttons states
  const [correctButtonIndex, setCorrectButtonIndex] = useState(0);
  const [shuffledLabels, setShuffledLabels] = useState([]);
  const [wrongClickCount, setWrongClickCount] = useState(0);

  // Date picker states
  const [targetDate, setTargetDate] = useState('1.12.2025');
  const [selectedDate, setSelectedDate] = useState('');
  const [dateUnlocked, setDateUnlocked] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Are you sure states
  const [confirmationLevel, setConfirmationLevel] = useState(0);

  // Ghost clicks states
  const [ghostClicks, setGhostClicks] = useState(0);
  const [showingGhostMessage, setShowingGhostMessage] = useState(false);

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const troll = trollTypes[questionNumber % trollTypes.length];
    setTrollType(troll);

    // Reset all states
    setButtonPosition({ x: 50, y: 50 });
    setRunawayAttempts(0);
    setIsPausing(false);
    setLoadingProgress(0);
    setLoadingText('');
    setLoadingPhase(0);
    setCorrectButtonIndex(Math.floor(Math.random() * 10));
    setShuffledLabels([...fakeButtonLabels].sort(() => Math.random() - 0.5));
    setWrongClickCount(0);
    // Random target date in 2025
    const randomDayIndex = Math.floor(Math.random() * allDays.length);
    setTargetDate(allDays[randomDayIndex].value);
    setSelectedDate('');
    setDateUnlocked(false);
    setDropdownOpen(false);
    setConfirmationLevel(0);
    setGhostClicks(0);
    setShowingGhostMessage(false);
  }, [questionNumber]);

  // Loading animation - now with 200% and auto-proceed
  useEffect(() => {
    if (trollType !== 'loading-99') return;

    const loadingTexts = [
      'Antwort wird übermittelt...',
      'Verbindung zum Server...',
      'Ihre Antwort wird auf moralische Korrektheit geprüft...',
      'Bitte warten...',
      'Fast fertig...',
    ];

    const overloadTexts = [
      'Warte... was?!',
      'Das sollte nicht passieren...',
      'ERROR: Zu viel Korrektheit erkannt',
      'System überlastet...',
      '🔥 ALLES BRENNT 🔥',
    ];

    let progress = 0;
    let textIndex = 0;
    let phase = 0;

    const interval = setInterval(() => {
      if (phase === 0 && progress < 99) {
        // Phase 0: Go to 99%
        progress += Math.random() * 15 + 5;
        if (progress >= 99) {
          progress = 99;
          phase = 1;
          setLoadingPhase(1);
          setLoadingText('Ihre Antwort wird auf moralische Korrektheit geprüft...');

          // After 4 seconds at 99%, start going to 200%
          setTimeout(() => {
            phase = 2;
            setLoadingPhase(2);
          }, 4000);
        } else if (progress > textIndex * 20 && textIndex < loadingTexts.length) {
          setLoadingText(loadingTexts[textIndex]);
          textIndex++;
        }
        setLoadingProgress(progress);
      } else if (phase === 2 && progress < 200) {
        // Phase 2: Go to 200%
        progress += Math.random() * 8 + 3;
        if (progress > 200) progress = 200;
        setLoadingProgress(progress);

        const overloadIndex = Math.floor((progress - 99) / 25);
        if (overloadIndex < overloadTexts.length) {
          setLoadingText(overloadTexts[overloadIndex]);
        }

        if (progress >= 200) {
          phase = 3;
          setLoadingPhase(3);
          setLoadingText('Na gut, du darfst weiter... 😵');

          // Auto-proceed after 2 seconds at 200%
          setTimeout(() => {
            onNext();
          }, 2000);
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [trollType, onNext]);

  // Runaway button logic
  const moveButtonAway = useCallback(() => {
    if (trollType !== 'runaway') return;

    const newAttempts = runawayAttempts + 1;
    setRunawayAttempts(newAttempts);

    if (newAttempts === 5) {
      setIsPausing(true);
      setTimeout(() => {
        setIsPausing(false);
        setButtonPosition({
          x: Math.random() * 70 + 15,
          y: Math.random() * 50 + 25,
        });
      }, 800);
      return;
    }

    if (newAttempts >= 7) {
      return;
    }

    setButtonPosition({
      x: Math.random() * 70 + 15,
      y: Math.random() * 50 + 25,
    });
  }, [trollType, runawayAttempts]);

  const handleRunawayHover = () => {
    if (!isPausing && runawayAttempts < 7) {
      moveButtonAway();
    }
  };

  const handleRunawayTouch = (e) => {
    e.preventDefault();
    if (!isPausing && runawayAttempts < 7) {
      moveButtonAway();
    }
  };

  // Fake buttons logic
  const handleFakeButtonClick = (index) => {
    if (index === correctButtonIndex) {
      onNext();
    } else {
      setWrongClickCount(prev => prev + 1);
      setCorrectButtonIndex(Math.floor(Math.random() * 10));
      setShuffledLabels([...fakeButtonLabels].sort(() => Math.random() - 0.5));
    }
  };

  // Date picker logic
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setDropdownOpen(false);
    if (date === targetDate) {
      setDateUnlocked(true);
    } else {
      setDateUnlocked(false);
    }
  };

  // Are you sure logic
  const handleConfirmClick = (answer) => {
    if (answer === 'no') {
      setConfirmationLevel(0);
      return;
    }

    const newLevel = confirmationLevel + 1;
    setConfirmationLevel(newLevel);

    if (newLevel >= 4) {
      onNext();
    }
  };

  // Ghost clicks logic
  const handleGhostClick = () => {
    const newClicks = ghostClicks + 1;
    setGhostClicks(newClicks);

    if (newClicks >= 3 && newClicks < 10) {
      setShowingGhostMessage(true);
      setTimeout(() => setShowingGhostMessage(false), 300);
    }

    if (newClicks >= 10) {
      setTimeout(() => onNext(), 500);
    }
  };

  const getConfirmationText = () => {
    switch (confirmationLevel) {
      case 0: return 'Bist du sicher?';
      case 1: return 'Wirklich ganz sicher?';
      case 2: return 'Also wirklich 100% sicher?';
      case 3: return 'Letzte Chance: Bist du dir absolut sicher?';
      default: return 'Bist du sicher?';
    }
  };

  // Format target date for display
  const getTargetDateLabel = () => {
    const found = allDays.find(d => d.value === targetDate);
    return found ? found.label : targetDate;
  };

  return (
    <div className="result-screen" ref={containerRef}>
      <div className="result-content">
        {/* Result Header */}
        <div className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? '✓' : '✗'}
        </div>
        <h2 className="result-title">
          {isCorrect ? 'Richtig!' : 'Falsch!'}
        </h2>
        {!isCorrect && (
          <p className="correct-answer">
            Die richtige Antwort war: <strong>{correctAnswer}</strong>
          </p>
        )}

        {/* Troll Image */}
        <div className="troll-image-container">
          <img
            src={trollImage || friend?.image}
            alt="Result"
            className="troll-image"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=?&background=667eea&color=fff&size=200`;
            }}
          />
        </div>

        {/* TROLL TYPE 1: Runaway Button */}
        {trollType === 'runaway' && (
          <div className="troll-container runaway-container">
            <button
              className={`runaway-button ${isPausing ? 'pausing' : ''}`}
              style={{
                left: `${buttonPosition.x}%`,
                top: `${buttonPosition.y}%`,
              }}
              onMouseEnter={handleRunawayHover}
              onTouchStart={handleRunawayTouch}
              onClick={() => runawayAttempts >= 7 && onNext()}
            >
              Weiter
            </button>
            {runawayAttempts > 0 && runawayAttempts < 7 && (
              <p className="troll-hint">
                {runawayAttempts < 3 ? 'Haha, erwisch mich doch!' :
                 runawayAttempts === 5 ? 'Okay okay, ich bleib ste- NOPE!' :
                 'Du gibst nicht auf, oder?'}
              </p>
            )}
            {runawayAttempts >= 7 && (
              <p className="troll-hint success">Na gut, du hast gewonnen... 😤</p>
            )}
          </div>
        )}

        {/* TROLL TYPE 2: Loading at 99% then 200% */}
        {trollType === 'loading-99' && (
          <div className="troll-container loading-container">
            <div className="loading-bar-wrapper">
              <div className={`loading-bar ${loadingPhase >= 2 ? 'overload' : ''}`}>
                <div
                  className={`loading-bar-fill ${loadingPhase >= 2 ? 'danger' : ''}`}
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                />
                {loadingProgress > 100 && (
                  <div
                    className="loading-bar-overflow"
                    style={{ width: `${loadingProgress - 100}%` }}
                  />
                )}
              </div>
              <span className={`loading-percentage ${loadingPhase >= 2 ? 'danger-text' : ''}`}>
                {loadingProgress.toFixed(0)}%
              </span>
            </div>
            <p className={`loading-text ${loadingPhase >= 2 ? 'danger-text' : ''}`}>
              {loadingText}
            </p>
            {loadingPhase === 1 && (
              <p className="loading-stuck">Einen Moment noch...</p>
            )}
          </div>
        )}

        {/* TROLL TYPE 3: Fake Buttons */}
        {trollType === 'fake-buttons' && (
          <div className="troll-container fake-buttons-container">
            <p className="fake-buttons-hint">
              Einer dieser Buttons führt weiter. Viel Glück! 🎰
            </p>
            <div className="fake-buttons-grid">
              {shuffledLabels.map((label, index) => (
                <button
                  key={index}
                  className="fake-button"
                  onClick={() => handleFakeButtonClick(index)}
                >
                  {label}
                </button>
              ))}
            </div>
            {wrongClickCount > 0 && (
              <p className="wrong-click-counter">
                Falsche Klicks: {wrongClickCount} 😈
              </p>
            )}
          </div>
        )}

        {/* TROLL TYPE 4: Annoying Date Picker */}
        {trollType === 'date-picker' && (
          <div className="troll-container date-picker-container">
            <p className="date-instruction">
              Wähle das Datum <strong>{getTargetDateLabel()}</strong> aus der Liste
            </p>
            <div className="date-picker-wrapper" ref={dropdownRef}>
              <button
                className="date-dropdown-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedDate ? allDays.find(d => d.value === selectedDate)?.label : '📅 Datum auswählen...'}
                <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
              </button>
              {dropdownOpen && (
                <div className="date-dropdown-list">
                  {allDays.map((day, index) => (
                    <button
                      key={index}
                      className={`date-option ${selectedDate === day.value ? 'selected' : ''}`}
                      onClick={() => handleDateSelect(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedDate && !dateUnlocked && (
              <p className="date-wrong">❌ Falsches Datum! Versuch es nochmal...</p>
            )}
            <button
              className={`next-button ${dateUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() => dateUnlocked && onNext()}
              disabled={!dateUnlocked}
            >
              {dateUnlocked ? '✅ Weiter!' : '🔒 Gesperrt'}
            </button>
            <p className="date-hint">
              (Tipp: Es gibt 365 Einträge. Viel Spaß beim Scrollen! 😈)
            </p>
          </div>
        )}

        {/* TROLL TYPE 5: Are You Sure */}
        {trollType === 'are-you-sure' && (
          <div className="troll-container confirm-container">
            <div className="confirm-dialog">
              <p className="confirm-text">{getConfirmationText()}</p>
              <div className="confirm-buttons">
                <button
                  className="confirm-button yes"
                  onClick={() => handleConfirmClick('yes')}
                >
                  Ja
                </button>
                <button
                  className="confirm-button no"
                  onClick={() => handleConfirmClick('no')}
                >
                  Nein
                </button>
              </div>
            </div>
            {confirmationLevel > 0 && (
              <p className="confirm-counter">
                Bestätigungen: {confirmationLevel}/4
              </p>
            )}
          </div>
        )}

        {/* TROLL TYPE 6: Ghost Clicks */}
        {trollType === 'ghost-clicks' && (
          <div className="troll-container ghost-container">
            <button
              className="ghost-button"
              onClick={handleGhostClick}
            >
              Weiter
            </button>
            {showingGhostMessage && (
              <p className="ghost-message">...</p>
            )}
            {ghostClicks >= 5 && ghostClicks < 10 && (
              <p className="ghost-hint">
                Hmm, funktioniert der Button? Klick nochmal...
              </p>
            )}
            {ghostClicks >= 10 && (
              <p className="ghost-hint">Wird geladen...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultScreen;
