
import { Category } from "@/types/lessons";

export const lessonData: Record<string, Category> = {
  alphabet: {
    id: "alphabet",
    title: "Alphabet",
    lessons: [
      {
        id: 'alphabet-1',
        title: 'Letters A-D',
        description: 'Learn the signs for A, B, C, and D',
        level: 'Beginner',
        xp: 50,
        duration: '10 min',
        content: ['A', 'B', 'C', 'D']
      },
      {
        id: 'alphabet-2',
        title: 'Letters E-H',
        description: 'Learn the signs for E, F, G, and H',
        level: 'Beginner',
        xp: 50,
        duration: '10 min',
        content: ['E', 'F', 'G', 'H']
      },
      {
        id: 'alphabet-3',
        title: 'Letters I-L',
        description: 'Learn the signs for I, J, K, and L',
        level: 'Beginner',
        xp: 50,
        duration: '10 min',
        content: ['I', 'J', 'K', 'L']
      },
      {
        id: 'alphabet-4',
        title: 'Letters M-P',
        description: 'Learn the signs for M, N, O, and P',
        level: 'Beginner',
        xp: 50,
        duration: '10 min',
        content: ['M', 'N', 'O', 'P']
      },
      {
        id: 'alphabet-5',
        title: 'Letters Q-T',
        description: 'Learn the signs for Q, R, S, and T',
        level: 'Intermediate',
        xp: 75,
        duration: '15 min',
        content: ['Q', 'R', 'S', 'T']
      },
      {
        id: 'alphabet-6',
        title: 'Letters U-Z',
        description: 'Learn the signs for U, V, W, X, Y, and Z',
        level: 'Intermediate',
        xp: 75,
        duration: '15 min',
        content: ['U', 'V', 'W', 'X', 'Y', 'Z']
      },
      {
        id: 'alphabet-7',
        title: 'Mixed Practice',
        description: 'Practice with a random mix of letters',
        level: 'Intermediate',
        xp: 100,
        duration: '20 min',
        content: ['B', 'C', 'D', 'E', 'F', 'L', 'R', 'S', 'T', 'U', 'V', 'W', 'Y']
      }
    ]
  },
  numbers: {
    id: "numbers",
    title: "Numbers",
    lessons: [
      {
        id: 'numbers-1',
        title: 'Numbers 1-5',
        description: 'Learn the signs for numbers 1 through 5',
        level: 'Beginner',
        xp: 50,
        duration: '10 min',
        content: ['1', '2', '3', '4', '5']
      },
      {
        id: 'numbers-2',
        title: 'Numbers 6-10',
        description: 'Learn the signs for numbers 6 through 10',
        level: 'Beginner',
        xp: 50,
        duration: '10 min',
        content: ['6', '7', '8', '9', '10']
      }
    ]
  },
  phrases: {
    id: "phrases",
    title: "Phrases",
    lessons: []
  }
};
