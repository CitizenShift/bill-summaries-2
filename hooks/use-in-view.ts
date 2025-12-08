"use client"
import { useEffect, useState, useRef } from 'react'

export function useInView(options?: IntersectionObserverInit) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isInView, setIsInView] = useState<boolean>(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const alreadyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (alreadyVisible) {
            setIsInView(true);
        }

        // Intersection Observer takes as input a ref to a current DOM element
        // callback checks if dom element intersects with ancestor/viewport
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect(); // we fire this once per component, lazy loads happen only once
                }
            },
            { threshold: 0.1, ...options }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    return { ref, isInView };
}

