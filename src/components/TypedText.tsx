
import React, { useState, useEffect } from 'react';

interface TypedTextProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
}

const TypedText: React.FC<TypedTextProps> = ({
  words,
  typingSpeed = 100,
  deletingSpeed = 80,
  pauseTime = 2000,
  className = "",
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const currentWord = words[selectedIndex];

    // If we're deleting text
    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayedText(currentWord.substring(0, displayedText.length - 1));
        
        // If all text is deleted, start typing the next word
        if (displayedText.length === 1) {
          setIsDeleting(false);
          setSelectedIndex((prev) => (prev + 1) % words.length);
        }
      }, deletingSpeed);
    } 
    // If we're paused (showing full word)
    else if (isPaused) {
      timer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
    } 
    // If we're typing text
    else {
      timer = setTimeout(() => {
        const nextText = currentWord.substring(0, displayedText.length + 1);
        setDisplayedText(nextText);
        
        // If full word is typed, pause before deleting
        if (nextText === currentWord) {
          setIsPaused(true);
        }
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, isPaused, selectedIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return <span className={className}>{displayedText}</span>;
};

export default TypedText;
