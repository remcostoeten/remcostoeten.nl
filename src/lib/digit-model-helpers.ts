type TDigitMeta = {
  isDigit: boolean;
  prev: string;
  next: string;
  carry: boolean;
};

export function formatNumber(value: number, intlOptions?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(undefined, intlOptions || {}).format(value);
}

export function splitFormatted(valueString: string): string[] {
  return valueString.split('');
}

export function buildDigitMeta(prevChars: string[], nextChars: string[]): TDigitMeta[] {
  const maxLength = Math.max(prevChars.length, nextChars.length);
  const result: TDigitMeta[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    const prevChar = i < prevChars.length ? prevChars[i] : '';
    const nextChar = i < nextChars.length ? nextChars[i] : '';
    
    const isDigit = /\d/.test(nextChar);
    const carry = determineCarry(prevChars, nextChars, i);
    
    result.push({
      isDigit,
      prev: prevChar,
      next: nextChar,
      carry,
    });
  }
  
  return result;
}

function determineCarry(prevChars: string[], nextChars: string[], index: number): boolean {
  const prevChar = index < prevChars.length ? prevChars[index] : '';
  const nextChar = index < nextChars.length ? nextChars[index] : '';
  
  if (!(/\d/.test(prevChar) && /\d/.test(nextChar))) {
    return false;
  }
  
  const prevDigit = parseInt(prevChar, 10);
  const nextDigit = parseInt(nextChar, 10);
  
  if (nextDigit === 0 && prevDigit === 9) {
    return true;
  }
  
  if (index > 0) {
    const prevLeftChar = index - 1 < prevChars.length ? prevChars[index - 1] : '';
    const nextLeftChar = index - 1 < nextChars.length ? nextChars[index - 1] : '';
    
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
