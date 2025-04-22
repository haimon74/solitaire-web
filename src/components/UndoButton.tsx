import React from 'react';
import './UndoButton.css';

interface UndoButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onClick, disabled }) => {
  return (
    <button 
      className="control-button"
      onClick={onClick}
      disabled={disabled}
    >
      Undo
    </button>
  );
};

export default React.memo(UndoButton); 