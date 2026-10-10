import { act, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHomeIntro } from './useHomeIntro';

const mocks = vi.hoisted(() => ({ revert: vi.fn(), from: vi.fn(), context: vi.fn() }));
vi.mock('gsap', () => ({ gsap: {
    from: mocks.from,
    context: mocks.context,
} }));

function Intro({ ready }: { ready: boolean }): ReactElement {
    const ref = useHomeIntro(ready);
    return <div ref={ref}>Conteúdo disponível</div>;
}

beforeEach((): void => {
    vi.clearAllMocks();
    mocks.context.mockImplementation((callback: () => void): { revert: () => void } => {
        callback();
        return { revert: mocks.revert };
    });
});
afterEach((): void => { vi.restoreAllMocks(); });

describe('Entrada do destaque', (): void => {
    it('anima só a primeira entrada e reverte ao sair, sem esconder conteúdo', (): void => {
        const mounted = render(<Intro ready={false} />);
        expect(mocks.from).not.toHaveBeenCalled();
        mounted.rerender(<Intro ready />);
        expect(mocks.from).toHaveBeenCalledTimes(1);
        expect(mocks.from.mock.calls[0]?.[1]).toMatchObject({ y: 10, duration: 0.35, clearProps: 'transform' });
        expect(mocks.from.mock.calls[0]?.[1]).not.toHaveProperty('opacity');
        mounted.rerender(<Intro ready={false} />);
        expect(mocks.revert).toHaveBeenCalled();
        mounted.rerender(<Intro ready />);
        expect(mocks.from).toHaveBeenCalledTimes(1);
        mounted.unmount();
    });
    it('não cria animação quando a preferência pede redução de movimento', (): void => {
        const media: MediaQueryList = { ...window.matchMedia(''), matches: true };
        vi.spyOn(window, 'matchMedia').mockReturnValue(media);
        render(<Intro ready />);
        expect(mocks.context).not.toHaveBeenCalled();
        expect(mocks.from).not.toHaveBeenCalled();
    });
    it('interrompe ao ativar redução de movimento e remove listener ao sair', (): void => {
        let listener: EventListenerOrEventListenerObject | null = null;
        const media: MediaQueryList = {
            ...window.matchMedia(''),
            addEventListener: vi.fn((type: string, callback: EventListenerOrEventListenerObject): void => {
                if (type === 'change') { listener = callback; }
            }),
            removeEventListener: vi.fn(),
        };
        vi.spyOn(window, 'matchMedia').mockReturnValue(media);
        const mounted = render(<Intro ready />);
        act((): void => {
            if (typeof listener === 'function') {
                const event: Event = new Event('change');
                Object.defineProperty(event, 'matches', { value: true });
                listener(event);
            }
        });
        expect(mocks.revert).toHaveBeenCalled();
        mounted.unmount();
        expect(media.removeEventListener).toHaveBeenCalledWith('change', listener);
    });
});
