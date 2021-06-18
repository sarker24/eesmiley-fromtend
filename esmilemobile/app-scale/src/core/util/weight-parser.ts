const SupportedUnits = new Set<string>(['kg', 'g']);

export default function parseWeightInKgs(message: string, unit: string): number | null {
  try {
    const weightRaw = parseFloat(message);

    if (!SupportedUnits.has(unit)) {
      return null;
    }

    if (isNaN(weightRaw)) {
      return null;
    }

    return unit === 'kg' ? weightRaw : weightRaw / 1000;
  } catch (error) {
    return null;
  }
}
