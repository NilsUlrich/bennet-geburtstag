import { useState, useEffect, useRef, useCallback } from 'react';
import './Question.css';

// Base URL for images (handles GitHub Pages path)
const BASE_URL = import.meta.env.BASE_URL;

// Phases after answering
const PHASES = {
  QUESTION: 'question',     // User can still click answers
  TENSION: 'tension',       // Building suspense - answers cycle
  REVEAL: 'reveal',         // Show correct/incorrect
  TROLL: 'troll',           // Troll mechanic appears
};

const trollTypes = [
  'runaway',           // Button flüchtet
  'loading-99',        // Ladebalken hängt bei 99%, geht dann bis 200%
  'fake-buttons',      // 10 Buttons, nur einer ist richtig
  'date-picker',       // Nerviges Datum auswählen
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

// Extract base name from image path
const getImageBaseName = (imagePath) => {
  if (!imagePath) return null;
  const filename = imagePath.split('/').pop();
  return filename
    .replace(/\.(png|jpg|jpeg)$/i, '')
    .replace(/_(success|fail|correct)$/i, '');
};

function Question({ question, questionNumber, totalQuestions, onAnswer, onNext }) {
  const [phase, setPhase] = useState(PHASES.QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [highlightedAnswer, setHighlightedAnswer] = useState(null);

  // Troll states - initialize with questionNumber
  const [trollType, setTrollType] = useState(() => trollTypes[questionNumber % trollTypes.length]);
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 50 });
  const [runawayAttempts, setRunawayAttempts] = useState(0);
  const [isPausing, setIsPausing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [correctButtonIndex, setCorrectButtonIndex] = useState(() => Math.floor(Math.random() * 10));
  const [shuffledLabels, setShuffledLabels] = useState(() => [...fakeButtonLabels].sort(() => Math.random() - 0.5));
  const [wrongClickCount, setWrongClickCount] = useState(0);
  const [targetDate, setTargetDate] = useState(() => allDays[Math.floor(Math.random() * allDays.length)].value);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateUnlocked, setDateUnlocked] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmationLevel, setConfirmationLevel] = useState(0);
  const [ghostClicks, setGhostClicks] = useState(0);
  const [showingGhostMessage, setShowingGhostMessage] = useState(false);

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Get result images (with BASE_URL for GitHub Pages)
  const baseName = getImageBaseName(question.image);
  const successImage = baseName ? `${BASE_URL}images/${baseName}_success.png` : null;
  const failImage = baseName ? `${BASE_URL}images/${baseName}_fail.png` : null;

  // Ref for scrolling
  const imagesRef = useRef(null);

  // Reset when question changes
  useEffect(() => {
    setPhase(PHASES.QUESTION);
    setSelectedAnswer(null);
    setIsCorrect(false);
    setHighlightedAnswer(null);

    // Reset troll states
    const troll = trollTypes[questionNumber % trollTypes.length];
    setTrollType(troll);
    setButtonPosition({ x: 50, y: 50 });
    setRunawayAttempts(0);
    setIsPausing(false);
    setLoadingProgress(0);
    setLoadingText('');
    setLoadingPhase(0);
    setCorrectButtonIndex(Math.floor(Math.random() * 10));
    setShuffledLabels([...fakeButtonLabels].sort(() => Math.random() - 0.5));
    setWrongClickCount(0);
    const randomDayIndex = Math.floor(Math.random() * allDays.length);
    setTargetDate(allDays[randomDayIndex].value);
    setSelectedDate('');
    setDateUnlocked(false);
    setDropdownOpen(false);
    setConfirmationLevel(0);
    setGhostClicks(0);
    setShowingGhostMessage(false);
  }, [questionNumber]);

  // Handle answer click
  const handleAnswerClick = (answerId) => {
    if (phase !== PHASES.QUESTION) return;

    setSelectedAnswer(answerId);
    setIsCorrect(answerId === question.correctAnswer);
    onAnswer(answerId); // Report to parent for scoring
    setPhase(PHASES.TENSION);
  };

  // Tension phase - cycle through answers
  useEffect(() => {
    if (phase !== PHASES.TENSION) return;

    let count = 0;
    const maxCycles = 8;
    const answers = question.answers;

    const interval = setInterval(() => {
      setHighlightedAnswer(answers[count % answers.length].id);
      count++;

      if (count >= maxCycles) {
        clearInterval(interval);
        setHighlightedAnswer(null);
        setPhase(PHASES.REVEAL);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [phase, question.answers]);

  // Reveal phase -> Troll phase + auto scroll
  useEffect(() => {
    if (phase !== PHASES.REVEAL) return;

    // Auto scroll to images section
    if (imagesRef.current) {
      imagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const timer = setTimeout(() => {
      setPhase(PHASES.TROLL);
    }, 1500);

    return () => clearTimeout(timer);
  }, [phase]);

  // Loading animation
  useEffect(() => {
    if (trollType !== 'loading-99' || phase !== PHASES.TROLL) return;

    const loadingTexts = [
      'Antwort wird übermittelt...',
      'Verbindung zum Server...',
      'Moralische Prüfung...',
      'Bitte warten...',
      'Fast fertig...',
    ];

    const overloadTexts = [
      'Warte... was?!',
      'Das sollte nicht passieren...',
      'ERROR: Zu viel Korrektheit',
      'System überlastet...',
      'ALLES BRENNT',
    ];

    let progress = 0;
    let textIndex = 0;
    let currentPhase = 0;

    const interval = setInterval(() => {
      if (currentPhase === 0 && progress < 99) {
        progress += Math.random() * 15 + 5;
        if (progress >= 99) {
          progress = 99;
          currentPhase = 1;
          setLoadingPhase(1);
          setLoadingText('Moralische Prüfung...');
          setTimeout(() => {
            currentPhase = 2;
            setLoadingPhase(2);
          }, 3000);
        } else if (progress > textIndex * 20 && textIndex < loadingTexts.length) {
          setLoadingText(loadingTexts[textIndex]);
          textIndex++;
        }
        setLoadingProgress(progress);
      } else if (currentPhase === 2 && progress < 200) {
        progress += Math.random() * 8 + 3;
        if (progress > 200) progress = 200;
        setLoadingProgress(progress);

        const overloadIndex = Math.floor((progress - 99) / 25);
        if (overloadIndex < overloadTexts.length) {
          setLoadingText(overloadTexts[overloadIndex]);
        }

        if (progress >= 200) {
          currentPhase = 3;
          setLoadingPhase(3);
          setLoadingText('Na gut, du darfst weiter...');
          setTimeout(() => onNext(), 1500);
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [trollType, phase, onNext]);

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

    if (newAttempts >= 7) return;

    setButtonPosition({
      x: Math.random() * 70 + 15,
      y: Math.random() * 50 + 25,
    });
  }, [trollType, runawayAttempts]);

  const handleRunawayHover = () => {
    if (!isPausing && runawayAttempts < 7) moveButtonAway();
  };

  const handleRunawayTouch = (e) => {
    e.preventDefault();
    if (!isPausing && runawayAttempts < 7) moveButtonAway();
  };

  // Fake buttons
  const handleFakeButtonClick = (index) => {
    if (index === correctButtonIndex) {
      onNext();
    } else {
      setWrongClickCount(prev => prev + 1);
      setCorrectButtonIndex(Math.floor(Math.random() * 10));
      setShuffledLabels([...fakeButtonLabels].sort(() => Math.random() - 0.5));
    }
  };

  // Date picker
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setDropdownOpen(false);
    setDateUnlocked(date === targetDate);
  };

  // Are you sure
  const handleConfirmClick = (answer) => {
    if (answer === 'no') {
      setConfirmationLevel(0);
      return;
    }
    const newLevel = confirmationLevel + 1;
    setConfirmationLevel(newLevel);
    if (newLevel >= 4) onNext();
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

  // Ghost clicks
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

  const getTargetDateLabel = () => {
    const found = allDays.find(d => d.value === targetDate);
    return found ? found.label : targetDate;
  };

  // Get answer button class
  const getAnswerClass = (answerId) => {
    let classes = 'answer-button';

    if (phase === PHASES.TENSION && highlightedAnswer === answerId) {
      classes += ' highlighted';
    }

    if (phase === PHASES.REVEAL || phase === PHASES.TROLL) {
      if (answerId === question.correctAnswer) {
        classes += ' correct';
      } else if (answerId === selectedAnswer && !isCorrect) {
        classes += ' incorrect';
      } else {
        classes += ' faded';
      }
    }

    return classes;
  };

  const showResultSection = phase === PHASES.REVEAL || phase === PHASES.TROLL;

  return (
    <div className={`question-screen ${showResultSection ? (isCorrect ? 'bg-correct' : 'bg-incorrect') : ''}`} ref={containerRef}>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="question-counter">
        Frage {questionNumber} von {totalQuestions}
      </div>

      <div className="question-image-container">
        <img
          src={`${BASE_URL}${question.image.replace(/^\//, '')}`}
          alt="Frage"
          className="question-image"
          onError={(e) => {
            e.target.src = 'https://ui-avatars.com/api/?name=?&background=667eea&color=fff&size=150';
          }}
        />
      </div>

      <h2 className="question-text">{question.question}</h2>

      {question.contentImage && (
        <div className="content-image-container">
          <img
            src={`${BASE_URL}${question.contentImage.replace(/^\//, '')}`}
            alt="Kontext"
            className="content-image"
          />
        </div>
      )}

      <div className="answers-list">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            className={getAnswerClass(answer.id)}
            onClick={() => handleAnswerClick(answer.id)}
            disabled={phase !== PHASES.QUESTION}
          >
            <span className="answer-letter">{answer.id}</span>
            <span className="answer-text">{answer.text}</span>
          </button>
        ))}
      </div>

      {/* Images Section - always visible at bottom */}
      <div className={`images-section ${phase === PHASES.TROLL ? 'decided' : ''}`} ref={imagesRef}>
        <div className="images-row">
          {/* Success Image */}
          <div className={`image-box ${phase === PHASES.TROLL && !isCorrect ? 'hidden' : ''} ${phase === PHASES.TROLL && isCorrect ? 'winner' : ''}`}>
            {successImage && (
              <img
                src={successImage}
                alt="Richtig"
                className="result-img"
                onError={(e) => {
                  e.target.src = 'https://ui-avatars.com/api/?name=OK&background=4ade80&color=fff&size=150';
                }}
              />
            )}
            <span className="image-label correct-label">Richtig</span>
          </div>

          {/* Fail Image */}
          <div className={`image-box ${phase === PHASES.TROLL && isCorrect ? 'hidden' : ''} ${phase === PHASES.TROLL && !isCorrect ? 'winner' : ''}`}>
            {failImage && (
              <img
                src={failImage}
                alt="Falsch"
                className="result-img"
                onError={(e) => {
                  e.target.src = `${BASE_URL}images/bennet_fail.png`;
                }}
              />
            )}
            <span className="image-label incorrect-label">Falsch</span>
          </div>
        </div>
      </div>

      {/* Troll Section */}
      {phase === PHASES.TROLL && (
        <div className="troll-section">
          {/* RUNAWAY */}
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
                <p className="troll-hint success">Na gut, du hast gewonnen...</p>
              )}
            </div>
          )}

          {/* LOADING 99% */}
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
            </div>
          )}

          {/* FAKE BUTTONS */}
          {trollType === 'fake-buttons' && (
            <div className="troll-container fake-buttons-container">
              <p className="fake-buttons-hint">
                Einer dieser Buttons führt weiter. Viel Glück!
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
                  Falsche Klicks: {wrongClickCount}
                </p>
              )}
            </div>
          )}

          {/* DATE PICKER */}
          {trollType === 'date-picker' && (
            <div className="troll-container date-picker-container" ref={dropdownRef}>
              <p className="date-instruction">
                Wähle das Datum <strong>{getTargetDateLabel()}</strong>
              </p>
              <div className="date-picker-wrapper">
                <button
                  className="date-dropdown-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {selectedDate ? allDays.find(d => d.value === selectedDate)?.label : 'Datum auswählen...'}
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
                <p className="date-wrong">Falsches Datum!</p>
              )}
              <button
                className={`next-button ${dateUnlocked ? 'unlocked' : 'locked'}`}
                onClick={() => dateUnlocked && onNext()}
                disabled={!dateUnlocked}
              >
                {dateUnlocked ? 'Weiter!' : 'Gesperrt'}
              </button>
            </div>
          )}

          {/* ARE YOU SURE */}
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

          {/* GHOST CLICKS */}
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
                  Hmm, funktioniert der Button?
                </p>
              )}
              {ghostClicks >= 10 && (
                <p className="ghost-hint">Wird geladen...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Question;
