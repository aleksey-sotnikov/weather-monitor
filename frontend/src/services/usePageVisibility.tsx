import { useEffect, useRef } from "react";

const FIVE_MINUTES = 5 * 60 * 1000; // 5 минут в миллисекундах

export function usePageVisibility(callback: () => void) {
    const lastTriggerTime = useRef<number>(Date.now());

    useEffect(() => {
        const handleVisibilityChange = () => {
            const now = Date.now();
            if (document.visibilityState === "visible" && now - lastTriggerTime.current > FIVE_MINUTES) {
                lastTriggerTime.current = now;
                callback();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [callback]);
}
