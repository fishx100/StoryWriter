export function countWords(value: string): number {
  const words = value.match(
    /[\p{Script=Han}]|[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu,
  );

  return words?.length ?? 0;
}
