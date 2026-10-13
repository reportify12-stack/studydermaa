import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Award,
  ChevronRight,
  Flame,
  Star,
  Plus,
} from 'lucide-react';
import { Question } from '../../types';
import { QuizQuestionModal } from './QuizQuestionModal';

export interface Match3PuzzleGameProps {
  questions: Question[];
  currentQIndex: number;
  userAnswers: Record<string, string>;
  onAnswerQuestion: (questionId: string, isCorrect: boolean, selectedOptionIndex: number) => void;
  onFinishQuiz: () => void;
  onExitGame: () => void;
}

const BOARD_SIZE = 7;
const GEM_TYPES = [
  { id: 0, name: 'Ruby', color: 'from-rose-500 to-red-600', icon: '💎', shadow: 'shadow-rose-500/30' },
  { id: 1, name: 'Sapphire', color: 'from-sky-500 to-blue-600', icon: '🔷', shadow: 'shadow-blue-500/30' },
  { id: 2, name: 'Emerald', color: 'from-emerald-500 to-teal-600', icon: '🟢', shadow: 'shadow-emerald-500/30' },
  { id: 3, name: 'Topaz', color: 'from-amber-400 to-orange-500', icon: '⭐', shadow: 'shadow-amber-500/30' },
  { id: 4, name: 'Amethyst', color: 'from-purple-500 to-pink-600', icon: '🔮', shadow: 'shadow-purple-500/30' },
];

export const Match3PuzzleGame: React.FC<Match3PuzzleGameProps> = ({
  questions,
  currentQIndex,
  userAnswers,
  onAnswerQuestion,
  onFinishQuiz,
  onExitGame,
}) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [selectedTile, setSelectedTile] = useState<{ r: number; c: number } | null>(null);
  const [movesRemaining, setMovesRemaining] = useState<number>(15);
  const [score, setScore] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [targetQuestionIndex, setTargetQuestionIndex] = useState<number>(0);
  const [movesBonusNotification, setMovesBonusNotification] = useState<string | null>(null);

  // Helper: Create random board without initial matches
  const createInitialBoard = useCallback((): number[][] => {
    let newBoard: number[][] = [];
    let hasMatches = true;

    while (hasMatches) {
      newBoard = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        const row: number[] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
          row.push(Math.floor(Math.random() * GEM_TYPES.length));
        }
        newBoard.push(row);
      }
      hasMatches = checkMatches(newBoard).length > 0;
    }
    return newBoard;
  }, []);

  // Check matching 3 or more horizontally or vertically
  function checkMatches(grid: number[][]): { r: number; c: number }[] {
    const matchesSet = new Set<string>();

    // Horizontal check
    for (let r = 0; r < BOARD_SIZE; r++) {
      let matchLen = 1;
      for (let c = 0; c < BOARD_SIZE; c++) {
        const isEnd = c === BOARD_SIZE - 1;
        const isMatch = !isEnd && grid[r][c] !== -1 && grid[r][c] === grid[r][c + 1];

        if (isMatch) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (let i = 0; i < matchLen; i++) {
              matchesSet.add(`${r},${c - i}`);
            }
          }
          matchLen = 1;
        }
      }
    }

    // Vertical check
    for (let c = 0; c < BOARD_SIZE; c++) {
      let matchLen = 1;
      for (let r = 0; r < BOARD_SIZE; r++) {
        const isEnd = r === BOARD_SIZE - 1;
        const isMatch = !isEnd && grid[r][c] !== -1 && grid[r][c] === grid[r + 1][c];

        if (isMatch) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (let i = 0; i < matchLen; i++) {
              matchesSet.add(`${r - i},${c}`);
            }
          }
          matchLen = 1;
        }
      }
    }

    return Array.from(matchesSet).map((key) => {
      const [r, c] = key.split(',').map(Number);
      return { r, c };
    });
  }

  // Initialize board on mount
  useEffect(() => {
    setBoard(createInitialBoard());
  }, [createInitialBoard]);

  // Find next uncompleted question
  const getNextUncompletedQuestionIndex = useCallback((): number => {
    const nextIdx = questions.findIndex((q) => userAnswers[q.id] === undefined);
    return nextIdx !== -1 ? nextIdx : currentQIndex;
  }, [questions, userAnswers, currentQIndex]);

  // Swap and resolve matches
  const handleTileClick = async (r: number, c: number) => {
    if (isProcessing) return;

    if (movesRemaining <= 0) {
      // Prompt user to answer question for moves!
      triggerQuestionModal();
      return;
    }

    if (!selectedTile) {
      setSelectedTile({ r, c });
      return;
    }

    // If clicked same tile, deselect
    if (selectedTile.r === r && selectedTile.c === c) {
      setSelectedTile(null);
      return;
    }

    // Check adjacency (cardinal directions only)
    const rowDiff = Math.abs(selectedTile.r - r);
    const colDiff = Math.abs(selectedTile.c - c);
    const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);

    if (!isAdjacent) {
      setSelectedTile({ r, c });
      return;
    }

    // Perform Swap
    setIsProcessing(true);
    const prevTile = selectedTile;
    setSelectedTile(null);

    const newBoard = board.map((row) => [...row]);
    const temp = newBoard[prevTile.r][prevTile.c];
    newBoard[prevTile.r][prevTile.c] = newBoard[r][c];
    newBoard[r][c] = temp;

    const matches = checkMatches(newBoard);

    if (matches.length === 0) {
      // Invalid move: revert swap
      setTimeout(() => {
        setIsProcessing(false);
      }, 250);
      return;
    }

    // Valid move! Deduct 1 move
    setMovesRemaining((prev) => Math.max(0, prev - 1));

    // Resolve cascades
    await resolveBoardCascades(newBoard, 1);
    setIsProcessing(false);
  };

  // Cascades resolver (drops gems & generates new ones)
  const resolveBoardCascades = async (currentGrid: number[][], cascadeStep: number) => {
    let grid = currentGrid.map((row) => [...row]);
    let matches = checkMatches(grid);

    if (matches.length === 0) {
      setComboStreak(0);
      return;
    }

    // Tally score for matched gems
    const pointsEarned = matches.length * 75 * cascadeStep;
    setScore((prev) => prev + pointsEarned);
    setComboStreak((prev) => prev + 1);

    // Mark matched gems as empty (-1)
    matches.forEach(({ r, c }) => {
      grid[r][c] = -1;
    });

    setBoard([...grid]);
    await new Promise((res) => setTimeout(res, 200));

    // Drop gems down (gravity)
    for (let c = 0; c < BOARD_SIZE; c++) {
      let emptyRow = BOARD_SIZE - 1;
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (grid[r][c] !== -1) {
          grid[emptyRow][c] = grid[r][c];
          if (emptyRow !== r) {
            grid[r][c] = -1;
          }
          emptyRow--;
        }
      }
      // Fill top empty spaces with random gems
      for (let r = emptyRow; r >= 0; r--) {
        grid[r][c] = Math.floor(Math.random() * GEM_TYPES.length);
      }
    }

    setBoard([...grid]);
    await new Promise((res) => setTimeout(res, 220));

    // Check for next cascading combo matches
    const nextMatches = checkMatches(grid);
    if (nextMatches.length > 0) {
      await resolveBoardCascades(grid, cascadeStep + 1);
    }
  };

  // Trigger Quiz Modal for Extra Moves
  const triggerQuestionModal = () => {
    const nextIdx = getNextUncompletedQuestionIndex();
    setTargetQuestionIndex(nextIdx);
    setShowQuestionModal(true);
  };

  // Handle Question Answer
  const handleAnswerModal = (isCorrect: boolean, selectedOptionIndex: number) => {
    const targetQ = questions[targetQuestionIndex];
    if (!targetQ) return;

    onAnswerQuestion(targetQ.id, isCorrect, selectedOptionIndex);
    setShowQuestionModal(false);

    if (isCorrect) {
      // 🌟 REWARD: +5 MOVES & CELEBRATION!
      setMovesRemaining((prev) => prev + 5);
      setScore((prev) => prev + 250); // Bonus score for answering question

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'],
      });

      setMovesBonusNotification('+5 Langkah Tambahan Diterima!');
      setTimeout(() => setMovesBonusNotification(null), 3000);
    } else {
      setMovesBonusNotification('Jawapan Salah. 0 Langkah Ditambah.');
      setTimeout(() => setMovesBonusNotification(null), 3000);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questions.filter((q) => {
    const ans = userAnswers[q.id];
    if (ans === undefined) return false;
    const target = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correctAnswer;
    return String(ans) === String(target);
  }).length;

  const currentQuestionObj = questions[targetQuestionIndex] || questions[0];

  return (
    <div id="match3-game-container" className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
            💎
          </div>
          <div>
            <h2 className="text-base font-black font-display text-stone-900 dark:text-stone-100">
              Mod Teka-Teki: Match-3 Gems
            </h2>
            <p className="text-xs text-stone-500">
              Padankan 3 permata atau lebih. Jawab soalan untuk menambah <strong>+5 Langkah</strong>!
            </p>
          </div>
        </div>

        {/* Meters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] text-stone-400 block font-bold uppercase">Langkah (Moves)</span>
            <span
              className={`text-base font-black ${
                movesRemaining <= 3 ? 'text-rose-600 animate-pulse' : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {movesRemaining}
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] text-stone-400 block font-bold uppercase">Markah Kombo</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hidden sm:block">
            <span className="text-[10px] text-stone-400 block font-bold uppercase">Soalan Kuiz</span>
            <span className="text-base font-black text-theme-primary">
              {correctCount} / {questions.length} Betul
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Match-3 Board Viewport */}
        <div className="md:col-span-2 p-4 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/80 shadow-xl flex flex-col items-center justify-center space-y-4">
          {/* Notification Alert */}
          {movesBonusNotification && (
            <div className="w-full py-2 px-4 rounded-xl text-center text-xs font-bold bg-theme-surface text-theme-primary border border-theme-primary/30 animate-fade-in">
              {movesBonusNotification}
            </div>
          )}

          {/* 7x7 Grid of Gems */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 p-2 rounded-2xl bg-stone-100 dark:bg-stone-950/80 border border-stone-200/60 dark:border-stone-800 select-none">
            {board.map((row, r) =>
              row.map((gemId, c) => {
                const isSelected = selectedTile?.r === r && selectedTile?.c === c;
                const gem = gemId >= 0 && gemId < GEM_TYPES.length ? GEM_TYPES[gemId] : null;

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleTileClick(r, c)}
                    disabled={isProcessing}
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all duration-200 cursor-pointer shadow-sm active:scale-90 ${
                      gem
                        ? `bg-gradient-to-br ${gem.color} ${gem.shadow} text-white`
                        : 'bg-transparent'
                    } ${
                      isSelected
                        ? 'ring-4 ring-white dark:ring-stone-200 scale-110 z-10 animate-pulse'
                        : 'hover:scale-104'
                    }`}
                  >
                    <span>{gem ? gem.icon : ''}</span>
                  </button>
                );
              })
            )}
          </div>

          <p className="text-[11px] text-stone-400 text-center">
            Sentuh permata dan sentuh permata bersebelahan untuk menukarnya. Padankan 3 sebaris!
          </p>
        </div>

        {/* Side Panel: Quiz Trigger & Actions */}
        <div className="space-y-4">
          {/* Prominent 'Jawab Soalan Untuk Moves' Card */}
          <div className="p-5 rounded-3xl border-2 border-rose-300 dark:border-rose-900 bg-gradient-to-br from-rose-50/70 via-pink-50/50 to-purple-50/60 dark:from-rose-950/30 dark:to-purple-950/20 shadow-md space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 font-display">
                  Talian Hayat Langkah
                </h3>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">
                  +5 Moves Setiap Jawapan Tepat
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Kehabisan langkah atau mahu kombo lebih panjang? Jawab soalan kuiz seterusnya untuk mendapatkan bonus moves!
            </p>

            <button
              id="get-moves-quiz-btn"
              type="button"
              onClick={triggerQuestionModal}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:opacity-95 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>JAWAB SOALAN UNTUK MOVES</span>
            </button>
          </div>

          {/* Progress & Submit Card */}
          <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Kemajuan Kuiz & Teka-Teki
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-600 dark:text-stone-400">Soalan Selesai:</span>
                <span className="text-stone-900 dark:text-stone-100 font-bold">
                  {answeredCount} / {questions.length}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-theme-primary transition-all duration-300"
                  style={{ width: `${(answeredCount / Math.max(1, questions.length)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={onFinishQuiz}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs btn-theme-primary shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hantar Keputusan Kuiz</span>
              </button>

              <button
                type="button"
                onClick={onExitGame}
                className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
              >
                Tukar Mod Kuiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Question Modal */}
      <QuizQuestionModal
        isOpen={showQuestionModal}
        question={currentQuestionObj}
        questionIndex={targetQuestionIndex}
        totalQuestions={questions.length}
        mode="match3"
        onAnswer={handleAnswerModal}
      />
    </div>
  );
};
