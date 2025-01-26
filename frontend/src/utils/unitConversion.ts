export type UnitSystem = "metric" | "imperial";

export const convertUnits = {
  // Volume conversions (mm³ to in³)
  volume: {
    toImperial: (mm3: number) => mm3 * 0.000061024,
    toMetric: (in3: number) => in3 * 16387.064,
  },
  // Surface area conversions (mm² to in²)
  surfaceArea: {
    toImperial: (mm2: number) => mm2 * 0.00155,
    toMetric: (in2: number) => in2 * 645.16,
  },
  // Length conversions (mm to in)
  length: {
    toImperial: (mm: number) => mm * 0.0393701,
    toMetric: (inch: number) => inch * 25.4,
  },
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const getUnitSymbol = (
  type: "volume" | "surfaceArea" | "length",
  unitSystem: UnitSystem
): string => {
  const symbols = {
    metric: {
      volume: "mm³",
      surfaceArea: "mm²",
      length: "mm",
    },
    imperial: {
      volume: "in³",
      surfaceArea: "in²",
      length: "in",
    },
  };
  return symbols[unitSystem][type];
};
