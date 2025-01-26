import { useLanguage } from "../contexts/languageUtils";
import { translations } from "../translations";

type MaterialKey = keyof typeof translations.en.materials;

interface MaterialCost {
  name: string;
  translationKey: MaterialKey;
  costPerCm3: number; // Cost per cubic centimeter in USD
  density: number; // g/cm³
}

const NTD_TO_USD = 1 / 31.5; // Conversion rate from NT$ to USD

// Material costs in NT$ per cm³, converted to USD
const MATERIALS: MaterialCost[] = [
  // Engineering Plastics
  {
    name: "POM",
    translationKey: "pom",
    costPerCm3: 4.5 * NTD_TO_USD,
    density: 1.41,
  },
  {
    name: "PC",
    translationKey: "pc",
    costPerCm3: 5 * NTD_TO_USD,
    density: 1.2,
  },
  {
    name: "ABS",
    translationKey: "abs",
    costPerCm3: 3 * NTD_TO_USD,
    density: 1.04,
  },
  {
    name: "PEEK",
    translationKey: "peek",
    costPerCm3: 35 * NTD_TO_USD,
    density: 1.32,
  },
  {
    name: "Nylon",
    translationKey: "nylon",
    costPerCm3: 6 * NTD_TO_USD,
    density: 1.14,
  },
  // Common Metals
  {
    name: "Aluminum 6061",
    translationKey: "aluminum6061",
    costPerCm3: 18 * NTD_TO_USD,
    density: 2.7,
  },
  {
    name: "Aluminum 7075",
    translationKey: "aluminum7075",
    costPerCm3: 22 * NTD_TO_USD,
    density: 2.81,
  },
  {
    name: "Brass",
    translationKey: "brass",
    costPerCm3: 28 * NTD_TO_USD,
    density: 8.5,
  },
  {
    name: "Copper",
    translationKey: "copper",
    costPerCm3: 30 * NTD_TO_USD,
    density: 8.96,
  },
  {
    name: "Steel 1045",
    translationKey: "steel1045",
    costPerCm3: 25 * NTD_TO_USD,
    density: 7.85,
  },
  {
    name: "Stainless 304",
    translationKey: "stainless304",
    costPerCm3: 32 * NTD_TO_USD,
    density: 8.0,
  },
  {
    name: "Stainless 316",
    translationKey: "stainless316",
    costPerCm3: 35 * NTD_TO_USD,
    density: 8.0,
  },
];

interface CostAnalysisProps {
  volume: number; // in mm³
  processingTime?: number; // in minutes
}

export function CostAnalysis({ volume, processingTime }: CostAnalysisProps) {
  const { t } = useLanguage();

  // Convert volume from mm³ to cm³
  const volumeInCm3 = volume / 1000;

  // Machine cost per hour (NT$ 1500 per hour for competitive Taiwanese manufacturing)
  const machineRate = 1500 * NTD_TO_USD;

  return (
    <div className="cost-analysis">
      <h3 className="cost-title">{t.cost.title}</h3>

      <div className="cost-grid">
        <div className="cost-section">
          <h4 className="cost-subtitle">{t.cost.materialCosts}</h4>
          <div className="cost-table">
            <div className="cost-table-header">
              <div className="cost-label">{t.cost.material}</div>
              <div className="cost-label">{t.cost.weight}</div>
              <div className="cost-label">{t.cost.cost}</div>
            </div>
            <div className="cost-table-body">
              {MATERIALS.map((material) => {
                const weight = volumeInCm3 * material.density;
                const materialCost = volumeInCm3 * material.costPerCm3;

                return (
                  <div key={material.name} className="cost-table-row">
                    <div className="cost-value">
                      {t.materials[material.translationKey] || material.name}
                    </div>
                    <div className="cost-value">{weight.toFixed(2)}g</div>
                    <div className="cost-value">${materialCost.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {processingTime && (
          <div className="cost-section">
            <h4 className="cost-subtitle">{t.cost.processingCosts}</h4>
            <div className="cost-details">
              <div className="cost-item">
                <span className="cost-label">{t.cost.machineTime}:</span>
                <span className="cost-value">
                  {processingTime} {t.analysis.minutes}
                </span>
              </div>
              <div className="cost-item">
                <span className="cost-label">{t.cost.machineCost}:</span>
                <span className="cost-value">
                  ${((processingTime / 60) * machineRate).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="cost-disclaimer">{t.cost.disclaimer}</div>
      </div>
    </div>
  );
}
