'use client';

import { useState, useEffect, useRef } from 'react';
import { AIChatbotPuzzleGame } from '@/lib/chatbot-puzzle-game';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [command, setCommand] = useState('');
  const [score, setScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentModule, setCurrentModule] = useState<'general' | 'library' | 'maze' | 'cipher'>('general');
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameInstance = useRef<AIChatbotPuzzleGame | null>(null);

  // Initialize game instance
  useEffect(() => {
    if (!gameInstance.current) {
      gameInstance.current = new AIChatbotPuzzleGame();
    }
  }, []);

  // Auto-scroll chat box
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Start the game
  const startGame = () => {
    if (!gameInstance.current) return;
    
    const name = playerName.trim() || 'Adventurer';
    gameInstance.current.player_name = name;
    
    const introMessage = gameInstance.current.start_game();
    setMessages([{ text: introMessage, sender: 'bot' }]);
    setGameStarted(true);
    
    // Focus on command input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Process command
  const processCommand = async () => {
    if (!command.trim() || isProcessing || !gameInstance.current) return;
    
    // Add user command to messages
    setMessages(prev => [...prev, { text: command, sender: 'user' }]);
    setIsProcessing(true);
    
    // Process command with game instance
    const response = gameInstance.current.process_command(command);
    
    // Update current module based on command or response
    if (command === '1' || command === 'library' || response.includes('Library of Whispers')) {
      setCurrentModule('library');
    } else if (command === '2' || command === 'maze' || response.includes('Ever-Changing Maze')) {
      setCurrentModule('maze');
    } else if (command === '3' || command === 'cipher' || response.includes('Forbidden Cipher')) {
      setCurrentModule('cipher');
    }
    
    // Add bot response to messages
    setTimeout(() => {
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
      setScore(gameInstance.current?.score || 0);
      setCommand('');
      setIsProcessing(false);
      
      // Focus on command input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500); // Simulate processing time
  };

  // Handle command suggestions
  const handleSuggestion = (cmd: string) => {
    setCommand(cmd);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Get command suggestions based on current module
  const getCommandSuggestions = () => {
    const commonCommands = {
      general: ['help', 'quit', 'score'],
      library: ['select The Guardian\'s Riddle', 'hint', 'puzzles'],
      maze: ['select The Shifting Maze', 'config', 'puzzles'],
      cipher: ['select The Alchemist\'s Challenge', 'rules', 'puzzles']
    };
    
    const suggestions = [...commonCommands.general];
    
    if (currentModule !== 'general' && commonCommands[currentModule]) {
      suggestions.push(...commonCommands[currentModule]);
    }
    
    if (currentModule === 'general') {
      suggestions.push('1', '2', '3');
    }
    
    return suggestions;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-mono">
      <header className="bg-slate-800 p-5 text-center border-b-2 border-slate-700">
        <h1 className="text-4xl text-cyan-400 m-0">The Mystical Tower</h1>
        <p className="mt-2">An AI-Powered Puzzle Adventure</p>
      </header>
      
      <main className="max-w-3xl mx-auto p-5">
        {!gameStarted ? (
          <div className="bg-slate-800 rounded-lg p-5 shadow-lg">
            <h2 className="text-xl mb-4">Welcome, Adventurer!</h2>
            <p className="mb-4">Enter your name to begin your journey through The Mystical Tower:</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && startGame()}
                placeholder="Your name"
                className="flex-1 p-3 rounded bg-slate-700 text-gray-200 border-none"
              />
              <button
                onClick={startGame}
                className="px-5 py-3 bg-cyan-700 text-white rounded font-bold hover:bg-cyan-600 transition-colors"
              >
                Begin Adventure
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-5 shadow-lg">
            <div className="text-right mb-2 text-cyan-400 font-bold">
              Score: <span>{score}</span>
            </div>
            
            <div 
              ref={chatBoxRef}
              className="h-[500px] overflow-y-auto bg-slate-900 rounded p-4 mb-4 whitespace-pre-wrap leading-relaxed"
            >
              {messages.map((msg, index) => (
                <div key={index} className={`mb-3 ${msg.sender === 'user' ? 'text-cyan-400 font-bold' : 'text-gray-200'}`}>
                  {msg.sender === 'user' ? `> ${msg.text}` : msg.text}
                </div>
              ))}
              {isProcessing && (
                <div className="text-gray-200">
                  Processing<span className="dots">...</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 items-center">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && processCommand()}
                placeholder="Enter your command..."
                className="flex-1 p-3 rounded bg-slate-700 text-gray-200 border-none"
                disabled={isProcessing}
              />
              <button
                onClick={processCommand}
                disabled={isProcessing}
                className="px-5 py-3 bg-cyan-700 text-white rounded font-bold hover:bg-cyan-600 transition-colors disabled:bg-slate-600"
              >
                Send
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {getCommandSuggestions().map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestion(cmd)}
                  className="bg-slate-700 px-3 py-1 rounded text-sm hover:bg-cyan-700 transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer className="text-center p-5 bg-slate-800 border-t-2 border-slate-700 mt-5">
        <p>Created using Breadth-First Search, Bidirectional Search, and Simulated Annealing</p>
      </footer>
      
      <style jsx>{`
        .dots {
          display: inline-block;
          animation: dots 1.5s steps(5, end) infinite;
        }
        
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60% { content: '...'; }
          80%, 100% { content: ''; }
        }
      `}</style>
    </div>
  );
}
