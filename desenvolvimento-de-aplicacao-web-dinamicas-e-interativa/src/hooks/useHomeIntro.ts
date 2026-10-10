import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';

export function useHomeIntro(ready: boolean): RefObject<HTMLDivElement | null> {
    const element = useRef<HTMLDivElement | null>(null);
    const introduced = useRef<boolean>(false);

    useEffect((): (() => void) | undefined => {
        const target: HTMLDivElement | null = element.current;
        if (!ready || target === null || introduced.current) { return undefined; }
        introduced.current = true;
        const media: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (media.matches) { return undefined; }
        // Só deslocamento discreto: o artigo nunca fica invisível ou bloqueado.
        const context: gsap.Context = gsap.context((): void => {
            gsap.from(target, { y: 10, duration: 0.35, ease: 'power1.out', clearProps: 'transform' });
        }, target);
        const onMotionChange = (event: MediaQueryListEvent): void => {
            if (event.matches) { context.revert(); }
        };
        media.addEventListener('change', onMotionChange);
        return (): void => {
            media.removeEventListener('change', onMotionChange);
            context.revert();
        };
    }, [ready]);
    return element;
}
