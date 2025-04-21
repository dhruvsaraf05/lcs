import { useState, useEffect } from 'react';

export default function LCSVisualization() {
  const [string1, setString1] = useState('ABCBDAB');
  const [string2, setString2] = useState('BDCABA');
  const [lcsMatrix, setLcsMatrix] = useState([]);
  const [lcsResult, setLcsResult] = useState('');
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPath, setShowPath] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [totalSteps, setTotalSteps] = useState(0);

  // Generate random string
  const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleRandomStrings = () => {
    const randomStr1 = generateRandomString(8);
    const randomStr2 = generateRandomString(8);
    setString1(randomStr1);
    setString2(randomStr2);
  };

  // Calculate LCS
  const calculateLCS = () => {
    const m = string1.length;
    const n = string2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    const steps = [];
    
    // Build the dp table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (string1[i - 1] === string2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          steps.push({ i, j, value: dp[i][j], type: 'match' });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          steps.push({ i, j, value: dp[i][j], type: 'max' });
        }
      }
    }
    
    // Backtrack to find the LCS
    let i = m, j = n;
    let lcs = '';
    const path = [];
    
    while (i > 0 && j > 0) {
      if (string1[i - 1] === string2[j - 1]) {
        lcs = string1[i - 1] + lcs;
        path.push({ i, j, char: string1[i - 1] });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    setLcsMatrix(dp);
    setLcsResult(lcs);
    setTotalSteps(steps.length);
    return { matrix: dp, steps, path };
  };

  // Perform LCS calculation when inputs change
  useEffect(() => {
    const { steps, path } = calculateLCS();
    
    // Reset visualization state
    setCurrentStep(0);
    setHighlightedCells([]);
    setShowPath(false);
    
    // Store steps for animation
    const stepsCopy = [...steps];
    const pathCopy = [...path];
    
    // Update UI with initial state
    if (stepsCopy.length > 0) {
      setHighlightedCells([stepsCopy[0]]);
    }
    
  }, [string1, string2]);

  // Handle step-by-step visualization
  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      const { steps } = calculateLCS();
      setCurrentStep(currentStep + 1);
      setHighlightedCells([steps[currentStep + 1]]);
    } else if (currentStep === totalSteps - 1 && !showPath) {
      setShowPath(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      const { steps } = calculateLCS();
      setCurrentStep(currentStep - 1);
      setHighlightedCells([steps[currentStep - 1]]);
    } else if (showPath) {
      setShowPath(false);
    }
  };

  // Auto-play animation
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentStep < totalSteps - 1) {
          handleNextStep();
        } else if (currentStep === totalSteps - 1 && !showPath) {
          setShowPath(true);
        } else {
          setIsPlaying(false);
        }
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStep, totalSteps, showPath, speed]);

  // Toggle play/pause
  const togglePlay = () => {
    if (currentStep === totalSteps - 1 && showPath) {
      // Reset if at the end
      setCurrentStep(0);
      setShowPath(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Reset visualization
  const handleReset = () => {
    setCurrentStep(0);
    setShowPath(false);
    setIsPlaying(false);
    setHighlightedCells([]);
    const { steps } = calculateLCS();
    if (steps.length > 0) {
      setHighlightedCells([steps[0]]);
    }
  };

  const getCellColor = (i, j) => {
    if (showPath) {
      const { path } = calculateLCS();
      if (path.some(cell => cell.i === i && cell.j === j)) {
        return 'bg-green-400';
      }
    }
    
    if (highlightedCells.some(cell => cell.i === i && cell.j === j)) {
      return highlightedCells[0].type === 'match' ? 'bg-blue-300' : 'bg-yellow-200';
    }
    
    return 'bg-gray-100';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Longest Common Subsequence Visualization</h1>
      
      {/* Input controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">String 1:</label>
          <input
            type="text"
            value={string1}
            onChange={(e) => setString1(e.target.value.toUpperCase())}
            className="w-full p-2 border border-gray-300 rounded"
            maxLength={15}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">String 2:</label>
          <input
            type="text"
            value={string2}
            onChange={(e) => setString2(e.target.value.toUpperCase())}
            className="w-full p-2 border border-gray-300 rounded"
            maxLength={15}
          />
        </div>
      </div>
      
      <div className="flex justify-center space-x-2 mb-6">
        <button 
          onClick={handleRandomStrings}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Generate Random Strings
        </button>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
      
      {/* Visualization controls */}
      <div className="flex justify-center items-center space-x-4 mb-6">
        <button 
          onClick={handlePrevStep}
          disabled={currentStep === 0 && !showPath}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          ← Previous
        </button>
        
        <button 
          onClick={togglePlay}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        
        <button 
          onClick={handleNextStep}
          disabled={currentStep === totalSteps - 1 && showPath}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          Next →
        </button>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm">Speed:</span>
          <input
            type="range"
            min="100"
            max="1000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="w-24"
          />
        </div>
      </div>
      
      {/* Progress */}
      <div className="mb-4 text-center">
        <span className="text-sm">
          Step: {currentStep + 1} of {totalSteps} 
          {showPath ? " (Showing LCS Path)" : ""}
        </span>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* LCS Result */}
      <div className="mb-6 text-center">
        <span className="font-bold">LCS Result:</span> {lcsResult} (Length: {lcsResult.length})
      </div>
      
      {/* Matrix Visualization */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-200"></th>
              <th className="border p-2 bg-gray-200"></th>
              {string2.split('').map((char, index) => (
                <th key={index} className="border p-2 bg-gray-200 font-bold">
                  {char}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border p-2 bg-gray-200"></th>
              <td className="border p-2 text-center">0</td>
              {Array(string2.length).fill().map((_, j) => (
                <td key={j} className="border p-2 text-center">0</td>
              ))}
            </tr>
            {string1.split('').map((char, i) => (
              <tr key={i}>
                <th className="border p-2 bg-gray-200 font-bold">{char}</th>
                <td className="border p-2 text-center">0</td>
                {string2.split('').map((_, j) => {
                  const cellValue = lcsMatrix[i + 1]?.[j + 1] || 0;
                  return (
                    <td 
                      key={j} 
                      className={`border p-2 text-center ${getCellColor(i + 1, j + 1)}`}
                    >
                      {cellValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-blue-300"></div>
          <span>Character Match</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-yellow-200"></div>
          <span>Max Value</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-green-400"></div>
          <span>LCS Path</span>
        </div>
      </div>
      
      {/* Explanation */}
      <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
        <h3 className="font-bold mb-2">How it works:</h3>
        <p>The LCS algorithm uses dynamic programming to find the longest subsequence common to two strings. The table shows the length of the LCS for each prefix of the two strings. The final LCS is found by backtracking from the bottom-right corner of the matrix.</p>
        <ul className="list-disc pl-5 mt-2">
          <li>When characters match, we take the diagonal value + 1</li>
          <li>When characters don't match, we take the maximum of the left and top values</li>
          <li>The highlighted path shows the actual characters in the LCS</li>
        </ul>
      </div>
    </div>
  );
}