export interface Work {
  id: string;
  title: string;
  premise: string;
  genre: string;
  status: string;
}

export interface CreateWorkInput {
  title: string;
  premise: string;
  genre: string;
  status: string;
}

export interface UpdateWorkInput {
  title?: string;
  premise?: string;
  genre?: string;
  status?: string;
}
