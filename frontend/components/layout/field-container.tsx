"use client";

type FieldContainerProps = {
  fieldName: string;
  fieldValue: string;
};

export function FieldContainer({ fieldName, fieldValue }: FieldContainerProps) {
  return (
    <div className="sw-field-container">
      <p className="sw-field-title">{fieldName}</p>
      <p className="sw-field-value">{fieldValue}</p>
    </div>
  );
}
