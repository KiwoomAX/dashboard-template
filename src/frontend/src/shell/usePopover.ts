/* 팝오버 여닫기 — 본부 전환 드롭다운과 설정 판이 함께 쓴다.
   바깥을 누르거나 Esc 를 누르면 닫힌다. 여는 단추와 판 안을 누르는 것은 바깥이 아니다. */
import { useEffect, useRef, useState } from 'react';

export function usePopover<T extends HTMLElement, P extends HTMLElement>() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<T>(null);
  const panelRef = useRef<P>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return { open, setOpen, triggerRef, panelRef };
}
