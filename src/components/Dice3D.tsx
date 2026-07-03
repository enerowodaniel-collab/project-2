import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Dice3DProps {
  isRolling: boolean;
  value: number | null;
  size?: number;
}

export function Dice3D({ isRolling, value, size = 100 }: Dice3DProps) {
  const [displayValue, setDisplayValue] = useState(1);

  useEffect(() => {
    if (isRolling) {
      // Rapid value changes during roll
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);

      return () => clearInterval(interval);
    } else if (value) {
      setDisplayValue(value);
    }
  }, [isRolling, value]);

  // Dice face configurations (dot positions)
  const dotPositions: Record<number, { top: string; left: string }[][]> = {
    1: [[{ top: '50%', left: '50%' }]],
    2: [
      [{ top: '25%', left: '25%' }],
      [{ top: '75%', left: '75%' }],
    ],
    3: [
      [{ top: '25%', left: '25%' }],
      [{ top: '50%', left: '50%' }],
      [{ top: '75%', left: '75%' }],
    ],
    4: [
      [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }],
      [{ top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
    ],
    5: [
      [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }],
      [{ top: '50%', left: '50%' }],
      [{ top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
    ],
    6: [
      [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }],
      [{ top: '50%', left: '25%' }, { top: '50%', left: '75%' }],
      [{ top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
    ],
  };

  const dotSize = size / 7;

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        perspective: '600px',
        marginBottom: '2rem',
      }}
    >
      <motion.div
        animate={isRolling ? {
          rotateX: [0, 360, 720, 1080, 1440],
          rotateY: [0, 360, 720, 1080, 1440],
          rotateZ: [0, 180, 360, 540, 720],
        } : {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
        }}
        transition={isRolling ? {
          duration: 2,
          ease: 'easeOut',
        } : {
          duration: 0.5,
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dice shadow */}
        <motion.div
          animate={isRolling ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          } : {}}
          className="absolute rounded-2xl bg-black/20 blur-md"
          style={{
            width: size * 0.9,
            height: size * 0.9,
            left: size * 0.05,
            top: size * 0.95,
            transform: 'rotateX(90deg)',
          }}
        />

        {/* Dice body */}
        <motion.div
          className="absolute inset-0 rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          {/* Dots container */}
          <div className="absolute inset-2 flex items-center justify-center">
            <div className="relative w-full h-full">
              {dotPositions[displayValue].map((row, rowIdx) => (
                <div key={rowIdx} className="absolute" style={{ top: row[0].top, left: 0, right: 0 }}>
                  {row.map((dot, dotIdx) => (
                    <motion.div
                      key={dotIdx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: isRolling ? 0 : 0.1 * (rowIdx + dotIdx) }}
                      className="absolute rounded-full bg-gradient-to-br from-surface-700 to-surface-900"
                      style={{
                        width: dotSize,
                        height: dotSize,
                        top: `calc(${row[0].top} - ${dotSize / 2}px)`,
                        left: `calc(${dot.left} - ${dotSize / 2}px)`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Highlight */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Glow effect */}
      {isRolling && (
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
          className="absolute inset-0 rounded-full bg-primary-400 blur-2xl"
          style={{ zIndex: -1 }}
        />
      )}
    </div>
  );
}
