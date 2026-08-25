/**
 * Count Unicode code points so that surrogate-pair characters are not counted twice.
 */
export function countContentCharacters(content: string): number {
  return Array.from(content).length;
}