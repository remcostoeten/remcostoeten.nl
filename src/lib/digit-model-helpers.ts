export type TDigitMeta = {
  isDigit: boolean;
  prev: string;
  next: string;
  carry: boolean;
  index: number;
};

export function formatNumber(value: number, intlOptions?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(undefined, intlOptions || {}).format(value);
}

export function splitFormatted(valueString: string): string[] {
  return valueString.split('');
}

function padToMatch(shorter: string[], longer: string[]): string[] {
  const diff = longer.length - shorter.length;
  if (diff <= 0) return shorter;
  
  const padding = new Array(diff).fill('');
  return [...padding, ...shorter];
}

export function buildDigitMeta(prevChars: string[], nextChars: string[]): TDigitMeta[] {
  const maxLength = Math.max(prevChars.length, nextChars.length);
  
  const paddedPrev = prevChars.length < maxLength ? padToMatch(prevChars, nextChars) : prevChars;
  const paddedNext = nextChars.length < maxLength ? padToMatch(nextChars, prevChars) : nextChars;
  
  const result: TDigitMeta[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    const prevChar = paddedPrev[i] || '';
    const nextChar = paddedNext[i] || '';
    
    const isDigit = /\d/.test(nextChar) || /\d/.test(prevChar);
    const carry = determineCarry(paddedPrev, paddedNext, i);
    
    result.push({
      isDigit,
      prev: prevChar,
      next: nextChar,
      carry,
      index: i,
    });
  }
  
  return result;
}

function determineCarry(prevChars: string[], nextChars: string[], index: number): boolean {
  const prevChar = prevChars[index] || '';
  const nextChar = nextChars[index] || '';
  
  if (prevChar === '' && /\d/.test(nextChar)) {
    return true;
  }
  
  if (!(/\d/.test(prevChar) && /\d/.test(nextChar))) {
    return false;
  }
  
  const prevDigit = parseInt(prevChar, 10);
  const nextDigit = parseInt(nextChar, 10);
  
  if (nextDigit === 0 && prevDigit === 9) {
    return true;
  }
  
  if (index > 0) {
    const prevLeftChar = prevChars[index - 1] || '';
    const nextLeftChar = nextChars[index - 1] || '';
    
    if (/\d/.test(prevLeftChar) && /\d/.test(nextLeftChar)) {
      const prevLeftDigit = parseInt(prevLeftChar, 10);
      const nextLeftDigit = parseInt(nextLeftChar, 10);
      
      if (nextLeftDigit > prevLeftDigit && nextDigit < prevDigit) {
        return true;
      }
    }
  }
  
  return false;
}
