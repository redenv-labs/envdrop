import { useEffect, useState } from "react";
import { getEncryptedChars } from "@/lib/chars";

export interface UseDecryptTextOptions {
  delay?: number;
  speed?: number;
  encryptedChars?: string[];
  loop?: boolean;
  loopInterval?: number;
}

export const useDecryptText = (
  targetText: string | string[],
  options: UseDecryptTextOptions = {},
) => {
  const {
    delay = 0,
    speed = 10,
    encryptedChars = getEncryptedChars("blocks"),
    loop = false,
    loopInterval = 2000,
  } = options;

  const [text, setText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trigger, setTrigger] = useState(0);

  // We stringify targetText here just to use it as a stable dependency
  // so arrays don't cause infinite re-renders
  const targetTextStr = JSON.stringify(targetText);

  // Guard to ensure currentIndex resets if targetText gets smaller
  useEffect(() => {
    const textArray = Array.isArray(targetText) ? targetText : [targetText];
    if (currentIndex >= textArray.length) {
      setCurrentIndex(0);
    }
  }, [targetText, currentIndex]);

  useEffect(() => {
    const textArray = Array.isArray(targetText) ? targetText : [targetText];
    const currentTargetText = textArray[currentIndex] || textArray[0];
    const charPool = encryptedChars.join("");

    if (!charPool || !currentTargetText) {
      setText(currentTargetText || "");
      setIsDone(true);
      return;
    }

    setIsDone(false);

    let intervalId: ReturnType<typeof setInterval>;
    let nextTimeoutId: ReturnType<typeof setTimeout>;

    const timeoutId = setTimeout(
      () => {
        let currentIteration = 0;
        const maxIterations = currentTargetText.length * 2;

        intervalId = setInterval(() => {
          setText(
            currentTargetText
              .split("")
              .map((char, index) => {
                if (char === " ") return " ";
                if (index < currentIteration / 2) return char;
                return charPool[Math.floor(Math.random() * charPool.length)];
              })
              .join(""),
          );
          currentIteration++;

          if (currentIteration > maxIterations) {
            clearInterval(intervalId);
            setText(currentTargetText);
            setIsDone(true);

            if (loop || currentIndex < textArray.length - 1) {
              nextTimeoutId = setTimeout(() => {
                if (textArray.length === 1) {
                  setTrigger((prev) => prev + 1);
                } else {
                  setCurrentIndex((prev) => (prev + 1) % textArray.length);
                }
              }, loopInterval);
            }
          }
        }, speed);
      },
      currentIndex === 0 && trigger === 0 ? delay : 0,
    );

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      clearTimeout(nextTimeoutId);
    };
  }, [
    targetTextStr,
    delay,
    speed,
    encryptedChars.join(""),
    loop,
    loopInterval,
    currentIndex,
    trigger,
  ]);

  return { text, isDone };
};
