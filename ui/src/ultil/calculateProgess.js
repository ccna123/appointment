export const calculateProgress = (chapter, totalLength) => {
  return chapter === 1 ? 0 : Math.floor((chapter * 100) / totalLength);
};
