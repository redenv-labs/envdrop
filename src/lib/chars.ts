export const Charsets = {
  ascii:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
  blocks: "█▓▒░╳╱╲◆◇○●",
} as const;

export type CharsetType = keyof typeof Charsets;

/**
 * Get the character sets for the requested types.
 * @param types - The types of characters to include, e.g. "ascii", "blocks".
 * @returns An array containing the character strings for the requested types.
 */
export function getEncryptedChars(...types: CharsetType[]): string[] {
  return types.map((type) => Charsets[type]);
}
