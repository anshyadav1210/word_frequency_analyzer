export const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","in","on","at","to","for","of","with",
  "by","from","is","was","are","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall","can",
  "not","no","nor","so","yet","both","either","neither","this","that","these",
  "those","i","me","my","we","our","you","your","he","she","it","they","them",
  "his","her","its","their","what","which","who","whom","as","than","then",
  "when","where","how","all","each","every","more","also","about","up","out",
  "into","just","such","after","before","between","through","during","without",
  "within","against","there","here","now","only","very","too","much","many",
  "any","some","other","one","two","three","four","five","six","seven","eight",
  "nine","ten","s","t","re","ll","ve","d","m"
]);

export interface WordFreq {
  word: string;
  count: number;
}

export function countWords(text: string): WordFreq[] {
  const words = text.toLowerCase().match(/\b[a-z]{2,30}\b/g) || [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!STOPWORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}

export function truncateForAI(text: string, maxWords = 6000): string {
  return text.split(/\s+/).slice(0, maxWords).join(' ');
}
