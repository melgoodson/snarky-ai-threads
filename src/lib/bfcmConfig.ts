import { useState, useEffect } from "react";

/**
 * Snarky Humans BFCM Weekend 2026 ("Gifts With Attitude Sale")
 * Fixed Deadline: Monday, November 30, 2026 at 11:59:59 p.m. Pacific Time (America/Los_Angeles, UTC-8)
 * Technical Expiration: December 1, 2026 at 12:00:00 a.m. America/Los_Angeles = 2026-12-01T08:00:00.000Z
 * Final-Day (Monday) Start: November 30, 2026 at 12:00:00 a.m. America/Los_Angeles = 2026-11-30T08:00:00.000Z
 */
export const BFCM_MONDAY_START_UTC_MS = Date.UTC(2026, 10, 30, 8, 0, 0, 0); // Nov 30, 2026 00:00:00 PT
export const BFCM_EXPIRATION_UTC_MS = Date.UTC(2026, 11, 1, 8, 0, 0, 0);   // Dec 1, 2026 00:00:00 PT (Nov 30 11:59:59 PM PT)
export const BFCM_DISCOUNT_RATE = 0.25; // 25% Off Sitewide

export function isBfcmActive(nowMs: number = Date.now()): boolean {
  return nowMs < BFCM_EXPIRATION_UTC_MS;
}

export function isBfcmFinalDay(nowMs: number = Date.now()): boolean {
  return nowMs >= BFCM_MONDAY_START_UTC_MS && nowMs < BFCM_EXPIRATION_UTC_MS;
}

export interface BfcmCountdownState {
  isActive: boolean;
  isFinalDay: boolean;
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  formattedHhMmSs: string;
  formattedDaysHhMmSs: string;
}

export function getBfcmCountdownState(nowMs: number = Date.now()): BfcmCountdownState {
  const remainingMs = Math.max(0, BFCM_EXPIRATION_UTC_MS - nowMs);
  const isActive = remainingMs > 0;
  const isFinalDay = nowMs >= BFCM_MONDAY_START_UTC_MS && isActive;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const totalHours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    isActive,
    isFinalDay,
    remainingMs,
    days,
    hours,
    minutes,
    seconds,
    totalHours,
    formattedHhMmSs: `${pad(totalHours)} : ${pad(minutes)} : ${pad(seconds)}`,
    formattedDaysHhMmSs:
      days > 0
        ? `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`
        : `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`,
  };
}

export function useBfcmTimer(): BfcmCountdownState {
  const [state, setState] = useState<BfcmCountdownState>(() => getBfcmCountdownState());

  useEffect(() => {
    const update = () => {
      const next = getBfcmCountdownState();
      setState(next);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
