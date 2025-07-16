export function cleanText(text: string): string {
  // Replace multiple spaces with a single space, and trim each line
  const cleanedLines = text.split('\n').map(line => line.replace(/\s+/g, ' ').trim());
  // Filter out empty lines and join them back with a single newline
  return cleanedLines.filter(line => line.length > 0).join('\n');
}