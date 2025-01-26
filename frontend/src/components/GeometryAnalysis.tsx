import React from "react";
import { CostAnalysis } from "./CostAnalysis";
import { useLanguage } from "../contexts/languageUtils";

interface GeometryData {
  volume?: number;
  surface_area?: number;
  center_of_mass?: number[];
  processing_time?: number;
  error?: string;
  units?: string;
}

interface GeometryAnalysisProps {
  data: GeometryData;
}

export function GeometryAnalysis({ data }: GeometryAnalysisProps) {
  const { t } = useLanguage();

  if (data.error) {
    return (
      <div className="error-message">
        <p>{data.error}</p>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toFixed(2);
  const formatArray = (arr: number[]) =>
    arr.map((n) => formatNumber(n)).join(", ");

  return (
    <div className="analysis-container">
      <div className="analysis-card">
        <h3 className="analysis-title">{t.analysis.title}</h3>
        <div className="analysis-grid">
          {data.volume !== undefined && (
            <div className="analysis-item">
              <span className="analysis-label">{t.analysis.volume}: </span>
              <span className="analysis-value">
                {formatNumber(data.volume)} {data.units}³
              </span>
            </div>
          )}

          {data.surface_area !== undefined && (
            <div className="analysis-item">
              <span className="analysis-label">{t.analysis.surfaceArea}: </span>
              <span className="analysis-value">
                {formatNumber(data.surface_area)} {data.units}²
              </span>
            </div>
          )}

          {data.center_of_mass && (
            <div className="analysis-item full-width">
              <span className="analysis-label">
                {t.analysis.centerOfMass}:{" "}
              </span>
              <span className="analysis-value">
                [{formatArray(data.center_of_mass)}] {data.units}
              </span>
            </div>
          )}

          {data.processing_time && (
            <div className="analysis-item full-width">
              <span className="analysis-label">
                {t.analysis.processingTime}:{" "}
              </span>
              <span className="analysis-value">
                {formatNumber(data.processing_time)} {t.analysis.minutes}
              </span>
            </div>
          )}
        </div>
      </div>

      {data.volume && (
        <CostAnalysis
          volume={data.volume}
          processingTime={data.processing_time}
        />
      )}
    </div>
  );
}
