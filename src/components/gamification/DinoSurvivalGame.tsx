import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Heart,
  Award,
  Zap,
  Shield,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { Question } from '../../types';
import { QuizQuestionModal } from './QuizQuestionModal';

export interface DinoSurvivalGameProps {
  questions: Question[];
  currentQIndex: number;
  userAnswers: Record<string, string>;
  onAnswerQuestion: (questionId: string, isCorrect: boolean, selectedOptionIndex: number) => void;
  onFinishQuiz: () => void;
  onExitGame: () => void;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus_small' | 'cactus_large' | 'cactus_double' | 'bird';
  birdWingState?: number;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  width: number;
}

export const DinoSurvivalGame: React.FC<DinoSurvivalGameProps> = ({
  questions,
  currentQIndex,
  userAnswers,
  onAnswerQuestion,
  onFinishQuiz,
  onExitGame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game States
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused_question' | 'game_over'>('idle');
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [livesRemaining, setLivesRemaining] = useState(3);
  const [revivesUsed, setRevivesUsed] = useState(0);
  const [invincibleFrames, setInvincibleFrames] = useState(0);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // Active question targeted for revive
  const [targetQuestionIndex, setTargetQuestionIndex] = useState<number>(0);

  // References for requestAnimationFrame loop
  const animFrameIdRef = useRef<number | null>(null);
  const stateRef = useRef({
    distance: 0,
    speed: 5.5,
    dinoY: 170,
    dinoVY: 0,
    isJumping: false,
    isDucking: false,
    groundY: 200,
    gravity: 0.65,
    obstacles: [] as Obstacle[],
    clouds: [] as Cloud[],
    groundOffset: 0,
    invincibleTimer: 0,
    runFrame: 0,
    isPlaying: false,
  });

  // Calculate uncompleted questions count
  const answeredQuestionIds = Object.keys(userAnswers);
  const correctCount = questions.filter((q) => {
    const ans = userAnswers[q.id];
    if (ans === undefined) return false;
    const target = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correctAnswer;
    return String(ans) === String(target);
  }).length;

  const getNextUncompletedQuestionIndex = useCallback((): number => {
    const nextIdx = questions.findIndex((q) => userAnswers[q.id] === undefined);
    return nextIdx !== -1 ? nextIdx : currentQIndex;
  }, [questions, userAnswers, currentQIndex]);

  // Initialize clouds
  useEffect(() => {
    stateRef.current.clouds = [
      { x: 100, y: 35, speed: 0.5, width: 45 },
      { x: 300, y: 55, speed: 0.6, width: 60 },
      { x: 550, y: 30, speed: 0.4, width: 50 },
    ];
  }, []);

  // Jump Action
  const jump = useCallback(() => {
    if (stateRef.current.isPlaying && !stateRef.current.isJumping) {
      stateRef.current.dinoVY = -12.5;
      stateRef.current.isJumping = true;
    }
  }, []);

  // Duck Action
  const setDuck = useCallback((ducking: boolean) => {
    stateRef.current.isDucking = ducking;
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (gameState === 'idle') {
          startGame();
        } else if (gameState === 'playing') {
          jump();
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        setDuck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        setDuck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, jump, setDuck]);

  // Main Canvas Game Loop
  const runGameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    if (!s.isPlaying) return;

    // 1. Update Game Physics
    s.distance += 1;
    if (s.distance % 5 === 0) {
      setDistance(s.distance);
    }

    // Gradually speed up
    s.speed = 5.5 + Math.min(6, Math.floor(s.distance / 350) * 0.4);

    // Update Dino Jump & Gravity
    if (s.isJumping) {
      s.dinoY += s.dinoVY;
      s.dinoVY += s.gravity;

      const normalHeight = s.isDucking ? 24 : 40;
      if (s.dinoY >= s.groundY - normalHeight) {
        s.dinoY = s.groundY - normalHeight;
        s.dinoVY = 0;
        s.isJumping = false;
      }
    } else {
      const normalHeight = s.isDucking ? 24 : 40;
      s.dinoY = s.groundY - normalHeight;
    }

    // Update Ground offset
    s.groundOffset = (s.groundOffset + s.speed) % 20;

    // Update Clouds
    s.clouds.forEach((c) => {
      c.x -= c.speed;
      if (c.x + c.width < 0) {
        c.x = canvas.width + Math.random() * 80;
        c.y = 20 + Math.random() * 50;
      }
    });

    // Spawn Obstacles
    const lastObstacle = s.obstacles[s.obstacles.length - 1];
    const minGap = 220 + Math.random() * 140;
    if (!lastObstacle || canvas.width - lastObstacle.x > minGap) {
      // Chance of spawning cactus or bird (bird appears after distance > 400)
      const canSpawnBird = s.distance > 400 && Math.random() < 0.25;

      if (canSpawnBird) {
        const birdY = Math.random() < 0.5 ? s.groundY - 55 : s.groundY - 32;
        s.obstacles.push({
          x: canvas.width + 10,
          y: birdY,
          width: 32,
          height: 24,
          type: 'bird',
          birdWingState: 0,
        });
      } else {
        const rnd = Math.random();
        if (rnd < 0.45) {
          s.obstacles.push({
            x: canvas.width + 10,
            y: s.groundY - 36,
            width: 18,
            height: 36,
            type: 'cactus_small',
          });
        } else if (rnd < 0.8) {
          s.obstacles.push({
            x: canvas.width + 10,
            y: s.groundY - 44,
            width: 34,
            height: 44,
            type: 'cactus_double',
          });
        } else {
          s.obstacles.push({
            x: canvas.width + 10,
            y: s.groundY - 48,
            width: 22,
            height: 48,
            type: 'cactus_large',
          });
        }
      }
    }

    // Move & Filter Obstacles
    s.obstacles.forEach((ob) => {
      ob.x -= s.speed;
      if (ob.type === 'bird' && ob.birdWingState !== undefined) {
        if (s.distance % 8 === 0) {
          ob.birdWingState = ob.birdWingState === 0 ? 1 : 0;
        }
      }
    });
    s.obstacles = s.obstacles.filter((ob) => ob.x + ob.width > -20);

    // Collision Detection
    const dinoX = 60;
    const dinoW = s.isDucking ? 46 : 34;
    const dinoH = s.isDucking ? 24 : 40;
    const dinoBox = { x: dinoX + 4, y: s.dinoY + 4, width: dinoW - 8, height: dinoH - 6 };

    if (s.invincibleTimer > 0) {
      s.invincibleTimer -= 1;
      setInvincibleFrames(s.invincibleTimer);
    } else {
      let collided = false;
      for (const ob of s.obstacles) {
        const obBox = { x: ob.x + 4, y: ob.y + 4, width: ob.width - 8, height: ob.height - 6 };
        if (
          dinoBox.x < obBox.x + obBox.width &&
          dinoBox.x + dinoBox.width > obBox.x &&
          dinoBox.y < obBox.y + obBox.height &&
          dinoBox.y + dinoBox.height > obBox.y
        ) {
          collided = true;
          break;
        }
      }

      if (collided) {
        // Trigger onGameOver logic!
        s.isPlaying = false;
        const nextQIdx = getNextUncompletedQuestionIndex();

        // Check if there are still questions remaining to revive
        const hasUncompletedQuestions = questions.some((q) => userAnswers[q.id] === undefined);

        if (hasUncompletedQuestions) {
          setTargetQuestionIndex(nextQIdx);
          setGameState('paused_question');
          setShowQuestionModal(true);
          return;
        } else {
          // All questions answered, regular game over
          setGameState('game_over');
          return;
        }
      }
    }

    // 2. Render Canvas Elements
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background Gradient Sky
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#1c1917' : '#fafaf9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Clouds
    ctx.fillStyle = isDark ? '#292524' : '#e7e5e4';
    s.clouds.forEach((c) => {
      ctx.beginPath();
      ctx.roundRect(c.x, c.y, c.width, 14, 7);
      ctx.fill();
    });

    // Draw Ground Line & Texture
    ctx.strokeStyle = isDark ? '#44403c' : '#d6d3d1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, s.groundY);
    ctx.lineTo(canvas.width, s.groundY);
    ctx.stroke();

    // Ground bumps / pebbles
    ctx.fillStyle = isDark ? '#57534e' : '#a8a29e';
    for (let i = -s.groundOffset; i < canvas.width; i += 24) {
      ctx.fillRect(i, s.groundY + 4, 4, 2);
      ctx.fillRect(i + 12, s.groundY + 8, 2, 2);
    }

    // Draw Obstacles
    s.obstacles.forEach((ob) => {
      if (ob.type === 'bird') {
        // Pterodactyl Bird
        ctx.fillStyle = '#f97316'; // orange bird
        ctx.fillRect(ob.x + 8, ob.y + 6, 16, 10);
        // Beak
        ctx.fillRect(ob.x, ob.y + 8, 8, 6);
        // Wings
        if (ob.birdWingState === 0) {
          ctx.fillRect(ob.x + 10, ob.y - 6, 8, 12);
        } else {
          ctx.fillRect(ob.x + 10, ob.y + 12, 8, 10);
        }
      } else {
        // Cacti
        ctx.fillStyle = '#10b981'; // emerald green cactus
        // Main stem
        ctx.fillRect(ob.x + ob.width / 2 - 4, ob.y, 8, ob.height);
        // Arms
        if (ob.type === 'cactus_double' || ob.type === 'cactus_large') {
          ctx.fillRect(ob.x, ob.y + 10, 6, 12);
          ctx.fillRect(ob.x, ob.y + 16, ob.width / 2, 6);
          ctx.fillRect(ob.x + ob.width - 6, ob.y + 6, 6, 14);
          ctx.fillRect(ob.x + ob.width / 2, ob.y + 14, ob.width / 2, 6);
        } else {
          ctx.fillRect(ob.x, ob.y + 8, 4, 10);
          ctx.fillRect(ob.x, ob.y + 12, 8, 4);
        }
      }
    });

    // Draw Dinosaur
    // Flicker if invincible
    const showDino = s.invincibleTimer === 0 || Math.floor(s.invincibleTimer / 4) % 2 === 0;
    if (showDino) {
      ctx.fillStyle = '#059669'; // Teal / emerald dino
      s.runFrame = Math.floor(s.distance / 5) % 2;

      if (s.isDucking) {
        // Ducking Dino Body (wider, shorter)
        ctx.fillRect(dinoX, s.dinoY + 4, 38, 18);
        ctx.fillRect(dinoX + 30, s.dinoY, 14, 16); // Head lowered
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(dinoX + 38, s.dinoY + 2, 3, 3); // Eye
        ctx.fillStyle = '#059669';

        // Legs
        if (s.runFrame === 0) {
          ctx.fillRect(dinoX + 6, s.dinoY + 20, 6, 4);
          ctx.fillRect(dinoX + 22, s.dinoY + 20, 6, 2);
        } else {
          ctx.fillRect(dinoX + 6, s.dinoY + 20, 6, 2);
          ctx.fillRect(dinoX + 22, s.dinoY + 20, 6, 4);
        }
      } else {
        // Standing / Running Dino Body
        // Head
        ctx.fillRect(dinoX + 16, s.dinoY, 16, 14);
        ctx.fillRect(dinoX + 12, s.dinoY + 12, 18, 6);
        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(dinoX + 24, s.dinoY + 3, 3, 3);
        ctx.fillStyle = '#059669';
        // Body
        ctx.fillRect(dinoX + 6, s.dinoY + 14, 18, 18);
        // Tail
        ctx.fillRect(dinoX, s.dinoY + 18, 8, 8);
        ctx.fillRect(dinoX - 4, s.dinoY + 16, 5, 5);
        // Tiny Arm
        ctx.fillRect(dinoX + 22, s.dinoY + 20, 6, 3);

        // Running Legs
        if (s.isJumping) {
          ctx.fillRect(dinoX + 8, s.dinoY + 32, 5, 8);
          ctx.fillRect(dinoX + 18, s.dinoY + 32, 5, 6);
        } else if (s.runFrame === 0) {
          ctx.fillRect(dinoX + 8, s.dinoY + 32, 5, 8);
          ctx.fillRect(dinoX + 18, s.dinoY + 32, 5, 4);
        } else {
          ctx.fillRect(dinoX + 8, s.dinoY + 32, 5, 4);
          ctx.fillRect(dinoX + 18, s.dinoY + 32, 5, 8);
        }
      }
    }

    // Continue loop
    animFrameIdRef.current = requestAnimationFrame(runGameLoop);
  }, [getNextUncompletedQuestionIndex, questions, userAnswers]);

  // Start / Restart Game
  const startGame = useCallback(() => {
    stateRef.current.distance = 0;
    stateRef.current.speed = 5.5;
    stateRef.current.dinoY = 160;
    stateRef.current.dinoVY = 0;
    stateRef.current.isJumping = false;
    stateRef.current.isDucking = false;
    stateRef.current.obstacles = [];
    stateRef.current.invincibleTimer = 0;
    stateRef.current.isPlaying = true;

    setDistance(0);
    setGameState('playing');
    setShowQuestionModal(false);

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    animFrameIdRef.current = requestAnimationFrame(runGameLoop);
  }, [runGameLoop]);

  // Stop animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Handle Question Answer for Revive
  const handleAnswerRevive = (isCorrect: boolean, selectedOptionIndex: number) => {
    const targetQ = questions[targetQuestionIndex];
    if (!targetQ) return;

    // Record answer in parent state
    onAnswerQuestion(targetQ.id, isCorrect, selectedOptionIndex);
    setShowQuestionModal(false);

    if (isCorrect) {
      // 🌟 SUCCESSFUL REVIVE: Confetti, Invincible frame, clear obstacle, resume!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
      });

      setRevivesUsed((prev) => prev + 1);

      // Clear nearby obstacles ahead of Dino to give safe runway
      stateRef.current.obstacles = stateRef.current.obstacles.filter((ob) => ob.x > 320);
      stateRef.current.invincibleTimer = 110; // ~2 seconds invincibility
      stateRef.current.isPlaying = true;
      setGameState('playing');

      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      animFrameIdRef.current = requestAnimationFrame(runGameLoop);
    } else {
      // ❌ WRONG ANSWER: Game over session ends!
      setGameState('game_over');
      if (distance > highScore) {
        setHighScore(distance);
      }
    }
  };

  const currentQuestionObj = questions[targetQuestionIndex] || questions[0];

  return (
    <div id="dino-survival-container" className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            🦖
          </div>
          <div>
            <h2 className="text-base font-black font-display text-stone-900 dark:text-stone-100">
              Mod Survival: Dinosaur Runner
            </h2>
            <p className="text-xs text-stone-500">
              Jawab soalan dengan betul setiap kali terlanggar untuk <strong>Revive</strong>!
            </p>
          </div>
        </div>

        {/* Real-time Game Meters */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] text-stone-400 block font-sans font-bold uppercase">Jarak Larian</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {String(distance).padStart(5, '0')} m
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] text-stone-400 block font-sans font-bold uppercase">Soalan Dijawab</span>
            <span className="text-sm font-black text-theme-primary">
              {correctCount} / {questions.length} Betul
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hidden sm:block">
            <span className="text-[10px] text-stone-400 block font-sans font-bold uppercase">Revive Berjaya</span>
            <span className="text-sm font-black text-amber-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{revivesUsed}x</span>
            </span>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 shadow-xl">
        <canvas
          ref={canvasRef}
          width={760}
          height={250}
          className="w-full h-auto block select-none cursor-pointer"
          onClick={() => {
            if (gameState === 'idle') startGame();
            else if (gameState === 'playing') jump();
          }}
        />

        {/* Start Game Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl animate-bounce">
              <Play className="w-8 h-8 ml-1" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black font-display">
                Tekan Mula atau Tekan Spacebar
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 max-w-md">
                Lompat melepasi kaktus dan burung. Sekiranya terlanggar, soalan kuiz akan muncul sebagai peluang Revive nyawa!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              MULA BERLARI SEKARANG
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'game_over' && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-400 flex items-center justify-center font-bold text-2xl">
              💀
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black font-display text-white">
                Permainan Mod Survival Tamat
              </h3>
              <p className="text-xs text-stone-300">
                Peluang revive terhenti kerana jawapan salah atau semua soalan selesai dijawab.
              </p>
            </div>

            {/* Scoreboard Card */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md p-4 rounded-2xl bg-stone-900 border border-stone-800 text-left">
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Jarak Akhir</span>
                <span className="text-lg font-black text-emerald-400">{distance} m</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Skor Kuiz</span>
                <span className="text-lg font-black text-sky-400">
                  {correctCount} / {questions.length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Revive Digunakan</span>
                <span className="text-lg font-black text-amber-400">{revivesUsed}x</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={startGame}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-stone-900 hover:bg-stone-100 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Cuba Lagi</span>
              </button>
              <button
                onClick={onFinishQuiz}
                className="px-6 py-2.5 rounded-xl font-black text-xs btn-theme-primary shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hantar Keputusan Kuiz</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-Screen Mobile Jump & Duck Controls */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        <button
          type="button"
          onTouchStart={jump}
          onClick={jump}
          className="py-4 rounded-2xl bg-emerald-600 active:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md"
        >
          <ArrowUp className="w-5 h-5" />
          <span>LOMPAT (JUMP)</span>
        </button>
        <button
          type="button"
          onTouchStart={() => setDuck(true)}
          onTouchEnd={() => setDuck(false)}
          onMouseDown={() => setDuck(true)}
          onMouseUp={() => setDuck(false)}
          className="py-4 rounded-2xl bg-stone-700 active:bg-stone-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md"
        >
          <ArrowDown className="w-5 h-5" />
          <span>TUNDUK (DUCK)</span>
        </button>
      </div>

      {/* Control Instructions */}
      <div className="p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
        <div className="flex items-center gap-3">
          <span className="font-bold">Kawalan:</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-[11px] font-mono">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-[11px] font-mono">↑</kbd> untuk Lompat</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-[11px] font-mono">↓</kbd> untuk Tunduk</span>
        </div>
        <button
          onClick={onExitGame}
          className="font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          Tukar Mod Kuiz
        </button>
      </div>

      {/* Revive Quiz Question Modal */}
      <QuizQuestionModal
        isOpen={showQuestionModal}
        question={currentQuestionObj}
        questionIndex={targetQuestionIndex}
        totalQuestions={questions.length}
        mode="survival"
        onAnswer={handleAnswerRevive}
      />
    </div>
  );
};
