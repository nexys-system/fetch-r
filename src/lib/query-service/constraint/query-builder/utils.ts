/**
 * @see https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 * @param len: length of generated strings
 * @return random generated strings
 */
export const generateString = (len: number = 21): string => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};
