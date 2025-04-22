import React from 'react';
import './UndoButton.css';

interface UndoButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onClick, disabled }) => {
  return (
    <button 
      className={`undo-button ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <svg 
        className="undo-icon" 
        viewBox="0 0 24 24" 
        width="24" 
        height="24"
      >
        <path 
          d="M12.5 8C9.85 8 7.45 9 5.6 10.6L2 7V16H11L7.38 12.38C8.77 11.22 10.54 10.5 12.5 10.5C16.04 10.5 19.05 12.81 20.1 16L22.47 15.22C21.08 11.03 17.15 8 12.5 8Z"
          fill="currentColor"
        />
      </svg>
      Undo
    </button>
  );
};

export default React.memo(UndoButton); 