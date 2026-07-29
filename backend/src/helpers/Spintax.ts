export const parseSpintax = (text: string): string => {
  if (!text) return text;

  const spintaxRegex = /\{([^{}]+)\}/g;
  let result = text;

  while (spintaxRegex.test(result)) {
    let replaced = false;
    result = result.replace(spintaxRegex, (match, content) => {
      if (content.includes('|')) {
        replaced = true;
        const options = content.split('|');
        const randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
      }
      return match;
    });

    if (!replaced) break;
  }

  return result;
};

export default parseSpintax;
