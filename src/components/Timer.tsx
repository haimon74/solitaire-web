import React, { useState, useEffect } from 'react';
import styles from './GameBoard.module.css';

interface TimerProps {
  startTime: number;
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({ startTime, isRunning }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setSeconds(elapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.timer}>
      Time: {formatTime(seconds)}
    </div>
  );
};

export default Timer; 