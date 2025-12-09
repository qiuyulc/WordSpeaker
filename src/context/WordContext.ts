import { createContext } from "react";
export interface WordType {
  word: string;
  phonetic: string;
  key_word: boolean;
  definitions_by_pos: Record<string, string | undefined>;
}

export interface WordsType {
  title: string;
  words: WordType[];
}
export const WordContext = createContext<WordsType[]>([]);
