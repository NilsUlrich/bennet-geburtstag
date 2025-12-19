import { useState, useEffect } from 'react';
import './ChallengeScreen.css';

// Different challenge types
const challenges = [
  {
    type: 'captcha',
    title: 'Beweise, dass du kein Roboter bist',
    instruction: 'Wähle alle Bilder mit AMPELN aus',
    gridSize: 9,
    correctIndices: [],
  },
  {
    type: 'coding',
    title: '🧑‍💻 Coding Challenge',
    instruction: 'Implementiere die FizzBuzz Funktion!',
  },
];

// Generate fake captcha images
const generateCaptchaGrid = () => {
  const items = [];
  const fakeLabels = ['🚗', '🏠', '🌳', '🚌', '🏢', '🚶', '🚲', '🛵', '🏪'];
  for (let i = 0; i < 9; i++) {
    items.push({
      id: i,
      emoji: fakeLabels[i],
      selected: false,
    });
  }
  return items;
};

// Bubblesort coding challenge
const codingChallenge = {
  title: '🧑‍💻 Coding Challenge',
  description: `Implementiere den Bubblesort Algorithmus:

• Sortiere das Array aufsteigend
• Gib das sortierte Array zurück
• Verändere das Original-Array nicht`,
  template: `function bubbleSort(arr) {
  // Dein Code hier

}`,
  testCases: [
    { input: [5, 3, 8, 4, 2], expected: [2, 3, 4, 5, 8] },
    { input: [1], expected: [1] },
    { input: [3, 1], expected: [1, 3] },
    { input: [9, 7, 5, 3, 1], expected: [1, 3, 5, 7, 9] },
    { input: [1, 2, 3, 4, 5], expected: [1, 2, 3, 4, 5] },
    { input: [4, 2, 7, 1, 9, 3], expected: [1, 2, 3, 4, 7, 9] },
  ],
};

function ChallengeScreen({ onComplete, isEndChallenge = false }) {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [captchaGrid, setCaptchaGrid] = useState(generateCaptchaGrid());
  const [captchaFails, setCaptchaFails] = useState(0);
  const [captchaMessage, setCaptchaMessage] = useState('');

  // Coding challenge states
  const [code, setCode] = useState(codingChallenge.template);
  const [codeResult, setCodeResult] = useState('');
  const [codeAttempts, setCodeAttempts] = useState(0);
  const [testResults, setTestResults] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    if (isEndChallenge) {
      setChallengeIndex(1);
    } else {
      setChallengeIndex(0);
    }
  }, [isEndChallenge]);

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
      setCaptchaMessage('Na gut, du bist wohl doch ein Mensch... 🤖');
      setTimeout(() => onComplete(), 1500);
    } else {
      setCaptchaMessage('Falsch! Versuch es nochmal...');
      setCaptchaGrid(generateCaptchaGrid());
    }
  };

  const handleCodeRun = () => {
    setCodeAttempts(prev => prev + 1);
    const newAttempts = codeAttempts + 1;

    // Try to evaluate the code
    try {
      // Create a safe evaluation context
      const userFunction = new Function(`
        ${code}
        return typeof bubbleSort === 'function' ? bubbleSort : null;
      `)();

      if (!userFunction) {
        setCodeResult('❌ Error: Funktion "bubbleSort" nicht gefunden!');
        setTestResults([]);
        return;
      }

      // Run test cases
      const results = codingChallenge.testCases.map(test => {
        try {
          const result = userFunction([...test.input]); // Pass a copy
          const passed = JSON.stringify(result) === JSON.stringify(test.expected);
          return {
            input: test.input,
            expected: test.expected,
            got: result,
            passed,
          };
        } catch (e) {
          return {
            input: test.input,
            expected: test.expected,
            got: 'Error',
            passed: false,
          };
        }
      });

      setTestResults(results);
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;

      if (passedCount === totalCount) {
        setCodeResult(`✅ Alle ${totalCount} Tests bestanden! Du bist ein Coding-Genie! 🎉`);
        setTimeout(() => onComplete(), 2000);
      } else if (passedCount >= totalCount - 2) {
        setCodeResult(`⚠️ ${passedCount}/${totalCount} Tests bestanden. Fast!`);
      } else {
        setCodeResult(`❌ ${passedCount}/${totalCount} Tests bestanden. Weiter versuchen!`);
      }

      // After many attempts, offer easier path
      if (newAttempts >= 5 && passedCount < totalCount) {
        setShowHint(true);
      }

    } catch (error) {
      setCodeResult(`❌ Syntax Error: ${error.message}`);
      setTestResults([]);
    }
  };

  const getHint = () => {
    const hints = [
      'Tipp 1: Erstelle zuerst eine Kopie des Arrays mit [...arr]',
      'Tipp 2: Du brauchst zwei verschachtelte for-Schleifen',
      'Tipp 3: Vergleiche benachbarte Elemente und tausche sie wenn nötig',
      'Tipp 4: if (copy[j] > copy[j+1]) { tausche sie }',
    ];
    return hints[Math.min(hintLevel, hints.length - 1)];
  };

  const handleShowHint = () => {
    setHintLevel(prev => prev + 1);
  };

  const handleGiveUp = () => {
    setCodeResult('Na gut, du hast es versucht... Ich lass dich durch 😅');
    setTimeout(() => onComplete(), 1500);
  };

  const challenge = challenges[challengeIndex];

  return (
    <div className="challenge-screen">
      <div className="challenge-content">
        {/* CAPTCHA Challenge */}
        {challenge.type === 'captcha' && (
          <>
            <h2 className="challenge-title">{challenge.title}</h2>
            <p className="challenge-instruction">{challenge.instruction}</p>
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
              <p className="captcha-hint">
                Fehlversuche: {captchaFails}/3
              </p>
            </div>
          </>
        )}

        {/* Coding Challenge */}
        {challenge.type === 'coding' && (
          <>
            <h2 className="challenge-title">{codingChallenge.title}</h2>
            <div className="coding-container">
              <div className="challenge-description">
                {codingChallenge.description.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <textarea
                className="code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
              />

              {codeResult && (
                <p className={`code-result ${codeResult.includes('✅') ? 'success' : codeResult.includes('⚠️') ? 'warning' : 'error'}`}>
                  {codeResult}
                </p>
              )}

              {testResults.length > 0 && (
                <div className="test-results">
                  <p className="test-results-title">Test Ergebnisse:</p>
                  <div className="test-list">
                    {testResults.slice(0, 4).map((test, i) => (
                      <div key={i} className={`test-item ${test.passed ? 'passed' : 'failed'}`}>
                        <span className="test-icon">{test.passed ? '✓' : '✗'}</span>
                        <span className="test-detail">
                          bubbleSort([{test.input.join(',')}]) → {test.passed ? `[${test.expected.join(',')}]` : `[${Array.isArray(test.got) ? test.got.join(',') : test.got}] (erwartet: [${test.expected.join(',')}])`}
                        </span>
                      </div>
                    ))}
                    {testResults.length > 4 && (
                      <p className="test-more">...und {testResults.length - 4} weitere Tests</p>
                    )}
                  </div>
                </div>
              )}

              <button className="run-button" onClick={handleCodeRun}>
                ▶ Code ausführen
              </button>

              <p className="code-hint">
                Versuche: {codeAttempts}
              </p>

              {showHint && (
                <div className="hint-section">
                  <p className="hint-text">{getHint()}</p>
                  <div className="hint-buttons">
                    {hintLevel < 4 && (
                      <button className="hint-button" onClick={handleShowHint}>
                        Nächster Tipp
                      </button>
                    )}
                    {codeAttempts >= 8 && (
                      <button className="give-up-button" onClick={handleGiveUp}>
                        Aufgeben 😢
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChallengeScreen;
