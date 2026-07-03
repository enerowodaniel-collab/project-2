import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiContextType {
  showConfetti: (options?: ConfettiOptions) => void;
}

interface ConfettiOptions {
  count?: number;
  colors?: string[];
}

const ConfettiContext = createContext<ConfettiContextType | null>(null);

const DEFAULT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  delay: number;
}

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const showConfetti = useCallback((options?: ConfettiOptions) => {
    const count = options?.count ?? 50;
    const colors = options?.colors ?? DEFAULT_COLORS;

    const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: -5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      size: Math.random() * 10 + 5,
      delay: Math.random() * 0.2,
    }));

    setPieces(newPieces);

    setTimeout(() => {
      setPieces([]);
    }, 3000);
  }, []);

  return (
    <ConfettiContext.Provider value={{ showConfetti }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: '-5vh',
                rotate: piece.rotation,
                scale: 1,
              }}
              animate={{
                x: `${piece.x + (Math.random() - 0.5) * 30}vw`,
                y: '105vh',
                rotate: piece.rotation + 360 * Math.random(),
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2 + Math.random(),
                delay: piece.delay,
                ease: 'easeIn',
              }}
              style={{
                position: 'absolute',
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error('useConfetti must be used within a ConfettiProvider');
  }
  return context;
}
