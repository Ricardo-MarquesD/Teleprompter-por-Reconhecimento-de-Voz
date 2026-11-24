export type LineContent = {
  type: "text" | "technical";
  text: string;
};

export type VisualLine = {
  id: string;
  lauda_id: string;
  content: LineContent;
};

export type MatchingWord = {
  id: number;
  word: string;
  line_id: string;
  word_index_in_line: number;
};

export type Lauda = {
  id: string;
  title: string;
  presenter: string | null;
  first_line_id: string | null;
  order: number;
};

export type ScriptMeta = {
  program_name: string;
  create_at: string;
  total_words: number;
  total_lines: number;
  total_laudas: number;
};

export type SlugScript = {
  meta: ScriptMeta;
  visual_lines: VisualLine[];
  matching_words: MatchingWord[];
  laudas: Lauda[];
};
