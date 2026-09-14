import type {
  CollectionItem,
  CollectionTemplate,
  FieldType,
} from "@/types/collection";

function getDefaultValue(type: FieldType): unknown {
  switch (type) {
    case "text":
    case "textarea":
      return "";

    case "number":
      return null;

    case "checkbox":
      return false;
  }
}

export function createCollectionItem(
  template: CollectionTemplate
): CollectionItem {
  return {
    id: crypto.randomUUID(),
    name: "untitled",
    description: "",
    order_index: 0,
    fields: template.fields.map((field) => ({
      ...field,
      value: field.id === "name" && (field.type === "text" || field.type === "textarea")
        ? "untitled"
        : getDefaultValue(field.type),
    })),
  };
}
