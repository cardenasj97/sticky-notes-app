import type { Ref } from 'react';

interface TrashZoneProps {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Drop target for deletion. The dragged note toggles the `trash-zone--active`
 * class on this element imperatively (see StickyNote) so hovering it does not
 * trigger React re-renders during a drag.
 */
export function TrashZone({ ref }: TrashZoneProps) {
  return (
    <div ref={ref} className="trash-zone" aria-label="Trash zone">
      <span className="trash-zone__icon" aria-hidden>
        🗑
      </span>
      <span>Drop here to delete</span>
    </div>
  );
}
