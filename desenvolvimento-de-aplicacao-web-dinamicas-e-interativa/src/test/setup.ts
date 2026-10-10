import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach((): void => { cleanup(); localStorage.clear(); });

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn((): boolean => true),
    })),
});

class ResizeObserverMock implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}
window.ResizeObserver = ResizeObserverMock;
