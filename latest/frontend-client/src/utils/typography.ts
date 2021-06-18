const pxToPt = (px: number, targetDPI = 72, sourceDPI = 300): number =>
  px * (targetDPI / sourceDPI);

export { pxToPt };
