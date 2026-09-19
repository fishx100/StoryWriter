export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox";

export type FieldDefinition = {
  id: string;
  label: string;
  type: FieldType;
};

export type CollectionTemplate = {
  fields: FieldDefinition[];
};

export type ItemField = {
  id: string;
  label: string;
  type: FieldType;
  value: unknown;
};

export type CollectionItem = {
  id: string;
  name: string;
  description: string;
  order_index: number;
  status_tag_id?: string | null;
  fields: ItemField[];
};

export type Collection = {
  id: string;
  name: string;
  template: CollectionTemplate;
  items: CollectionItem[];
};
