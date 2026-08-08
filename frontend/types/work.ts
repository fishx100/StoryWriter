export interface Work {
  id: string;
  title: string;
  premise: string;
  genre: string;
  status_tag_id: string;
}

export interface CreateWorkInput {
  title: string;
  premise: string;
  genre: string;
  status_tag_id: string;
}

export interface UpdateWorkInput {
  title?: string;
  premise?: string;
  genre?: string;
  status_tag_id?: string;
}
