import { NOTE_COLORS } from '../types';

interface ToolbarProps {
  activeColor: string;
  onColorChange: (color: string) => void;
}

export function Toolbar({ activeColor, onColorChange }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar__palette" role="group" aria-label="New note color">
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={
              'swatch' + (color === activeColor ? ' swatch--active' : '')
            }
            style={{ background: color }}
            aria-label={`Use color ${color}`}
            aria-pressed={color === activeColor}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
      <p className="toolbar__hint">
        Drag on the board to create · Drag a note to move · Drag its corner to
        resize · Double-click to edit · Drop on the trash to delete
      </p>
    </div>
  );
}
