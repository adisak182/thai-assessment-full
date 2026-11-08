import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function ModalPortal({ children, label, onClose }) {
  const root = useRef(null);
  const focusable = () => [...root.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(node => node.getClientRects().length);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    const padding = document.body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + gap}px`;
    document.body.style.overflow = 'hidden';
    const page = document.getElementById('root');
    const wasInert = page?.inert;
    if (page) page.inert = true;
    root.current.focus({ preventScroll: true });
    root.current.querySelector('.modal-surface')?.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = padding;
      if (page) page.inert = wasInert;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  const onKeyDown = event => {
    if (event.key === 'Escape' && onClose) { event.preventDefault(); onClose(); }
    if (event.key !== 'Tab') return;
    const nodes = focusable();
    if (!nodes.length) { event.preventDefault(); return; }
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (document.activeElement === root.current) { event.preventDefault(); (event.shiftKey ? last : first).focus(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === root.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return createPortal(<div ref={root} className="modal-portal" style={{position: 'fixed', inset: 0, zIndex: 9000}} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onKeyDown={onKeyDown}>{children}</div>, document.body);
}
