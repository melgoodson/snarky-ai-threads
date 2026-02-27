import { useState, useEffect, useCallback } from "react";

const SNARKY_MESSAGES = [
    "Loading greatness… because basic loads faster, but we don't do basic.",
    "Good things take time. So do legendary shopping experiences.",
    "If this loads any faster, we'd have to charge extra.",
    "Hang tight. We're making sure it's worth your credit card's attention.",
    "Loading your next obsession… hope your cart is emotionally prepared.",
    "Warming up the good stuff. You deserve something dangerously fun.",
    "Getting things ready. You're about 3 seconds away from a better decision.",
];

/**
 * Returns a snarky loading message that rotates every `intervalMs`.
 * The message only cycles while `active` is true.
 */
export const useSnarkyLoader = (active: boolean, intervalMs = 4000) => {
    const pick = useCallback(
        () => SNARKY_MESSAGES[Math.floor(Math.random() * SNARKY_MESSAGES.length)],
        []
    );

    const [message, setMessage] = useState(pick);

    useEffect(() => {
        if (!active) {
            setMessage(pick());
            return;
        }

        const id = setInterval(() => setMessage(pick()), intervalMs);
        return () => clearInterval(id);
    }, [active, intervalMs, pick]);

    return message;
};
