import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from './index';
import { NOTE_COLORS } from '../../types';

describe('Toolbar', () => {
  it('renders one swatch per palette color', () => {
    render(<Toolbar activeColor={NOTE_COLORS[0]} onColorChange={() => {}} />);
    const swatches = screen.getAllByRole('button', { name: /Use color/ });
    expect(swatches).toHaveLength(NOTE_COLORS.length);
  });

  it('marks the active swatch as pressed', () => {
    render(<Toolbar activeColor={NOTE_COLORS[2]} onColorChange={() => {}} />);
    expect(screen.getByLabelText(`Use color ${NOTE_COLORS[2]}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText(`Use color ${NOTE_COLORS[0]}`)).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onColorChange with the picked color', async () => {
    const onColorChange = vi.fn();
    const user = userEvent.setup();
    render(<Toolbar activeColor={NOTE_COLORS[0]} onColorChange={onColorChange} />);

    await user.click(screen.getByLabelText(`Use color ${NOTE_COLORS[3]}`));

    expect(onColorChange).toHaveBeenCalledWith(NOTE_COLORS[3]);
  });
});
