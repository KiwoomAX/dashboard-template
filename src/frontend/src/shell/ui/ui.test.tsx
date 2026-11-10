import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Button, Card, Input, Modal } from './index';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

describe('공용 컴포넌트', () => {
  it('Button 은 기본이 테두리 단추이고 폼을 제출하지 않는다', () => {
    render(<Button>저장</Button>);
    const button = screen.getByRole('button', { name: '저장' });
    expect(button.className).toBe('kw-btn kw-btn--outline kw-btn--md');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('Button 은 variant 와 size 를 클래스로 바꾼다', () => {
    render(<Button variant="primary" size="sm">보내기</Button>);
    expect(screen.getByRole('button').className).toBe('kw-btn kw-btn--primary kw-btn--sm');
  });

  it('Input 은 invalid 일 때만 잘못된 입력으로 표시한다', () => {
    const { rerender } = render(<Input aria-label="금액" />);
    expect(screen.getByLabelText('금액').getAttribute('aria-invalid')).toBeNull();
    rerender(<Input aria-label="금액" invalid />);
    expect(screen.getByLabelText('금액').getAttribute('aria-invalid')).toBe('true');
  });

  it('Card 는 제목이 없으면 제목 요소를 그리지 않는다', () => {
    const { container, rerender } = render(<Card>내용</Card>);
    expect(container.querySelector('.kw-card__head')).toBeNull();
    rerender(<Card actions={<Button>전체 보기</Button>}>내용</Card>);
    expect(container.querySelector('h3')).toBeNull();
    expect(screen.getByRole('button', { name: '전체 보기' })).toBeTruthy();
    rerender(<Card title="운용 현황">내용</Card>);
    expect(screen.getByRole('heading', { name: '운용 현황' })).toBeTruthy();
  });

  it('Modal 은 open 을 따르고 X 와 Esc 로 onClose 를 호출한다', () => {
    const onClose = vi.fn();
    const { container, rerender } = render(<Modal open={false} onClose={onClose} title="확인">본문</Modal>);
    const dialog = container.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);
    expect(screen.queryByText('본문')).toBeNull();

    rerender(<Modal open onClose={onClose} title="확인">본문</Modal>);
    expect(dialog.open).toBe(true);
    fireEvent.click(screen.getByLabelText('닫기', { selector: 'button' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(2);

    rerender(<Modal open={false} onClose={onClose} title="확인">본문</Modal>);
    expect(dialog.open).toBe(false);
  });

  it('Modal 은 브라우저가 직접 닫아도 열린 동안에만 onClose 를 호출한다', () => {
    const onClose = vi.fn();
    const { container, rerender } = render(<Modal open onClose={onClose} title="확인">본문</Modal>);
    const dialog = container.querySelector('dialog') as HTMLDialogElement;
    fireEvent(dialog, new Event('close'));
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<Modal open={false} onClose={onClose} title="확인">본문</Modal>);
    fireEvent(dialog, new Event('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
