export interface Scene {
  id: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  order_index: number;
  word_count: number;
}

export interface CreateSceneInput {
  title: string;
  summary?: string;
  content?: string;
  status?: string;
}
