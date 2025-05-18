import React from 'react';
import styles from './UndoButton.module.css';

interface UndoButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onClick, disabled }) => {
  return (
    <button 
      className={`${styles.undoButton} ${disabled ? styles.disabled : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      Undo
    </button>
  );
};

export default React.memo(UndoButton); 