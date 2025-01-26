import { useState } from "react";
import { CostAnalysis } from "./CostAnalysis";
import { useLanguage } from "../contexts/languageUtils";
import {
  convertUnits,
  formatNumber,
  getUnitSymbol,
  UnitSystem,
} from "../utils/unitConversion";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

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
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  if (data.error) {
    return (
      <div className="error-message">
        <p>{data.error}</p>
      </div>
    );
  }

  const convertValue = (
    value: number,
    type: "volume" | "surfaceArea" | "length"
  ) => {
    return unitSystem === "imperial"
      ? convertUnits[type].toImperial(value)
      : value;
  };

  const renderTooltip = (content: string) => <Tooltip>{content}</Tooltip>;

  return (
    <div className="analysis-container">
      <div className="analysis-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="analysis-title">{t.analysis.title}</h3>
          <div className="btn-group">
            <button
              className={`btn btn-sm ${
                unitSystem === "metric" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setUnitSystem("metric")}
            >
              {t.units.metric}
            </button>
            <button
              className={`btn btn-sm ${
                unitSystem === "imperial"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setUnitSystem("imperial")}
            >
              {t.units.imperial}
            </button>
          </div>
        </div>

        <div className="analysis-grid">
          {data.volume !== undefined && (
            <OverlayTrigger
              placement="top"
              overlay={renderTooltip(t.tooltips.volume)}
            >
              <div className="analysis-item">
                <span className="analysis-label">{t.analysis.volume}: </span>
                <span className="analysis-value">
                  {formatNumber(convertValue(data.volume, "volume"))}{" "}
                  {getUnitSymbol("volume", unitSystem)}
                </span>
              </div>
            </OverlayTrigger>
          )}

          {data.surface_area !== undefined && (
            <OverlayTrigger
              placement="top"
              overlay={renderTooltip(t.tooltips.surfaceArea)}
            >
              <div className="analysis-item">
                <span className="analysis-label">
                  {t.analysis.surfaceArea}:{" "}
                </span>
                <span className="analysis-value">
                  {formatNumber(convertValue(data.surface_area, "surfaceArea"))}{" "}
                  {getUnitSymbol("surfaceArea", unitSystem)}
                </span>
              </div>
            </OverlayTrigger>
          )}

          {data.center_of_mass && (
            <OverlayTrigger
              placement="top"
              overlay={renderTooltip(t.tooltips.centerOfMass)}
            >
              <div className="analysis-item full-width">
                <span className="analysis-label">
                  {t.analysis.centerOfMass}:{" "}
                </span>
                <span className="analysis-value">
                  [
                  {data.center_of_mass
                    .map((val) => formatNumber(convertValue(val, "length")))
                    .join(", ")}
                  ] {getUnitSymbol("length", unitSystem)}
                </span>
              </div>
            </OverlayTrigger>
          )}

          {data.processing_time && (
            <OverlayTrigger
              placement="top"
              overlay={renderTooltip(t.tooltips.processingTime)}
            >
              <div className="analysis-item full-width">
                <span className="analysis-label">
                  {t.analysis.processingTime}:{" "}
                </span>
                <span className="analysis-value">
                  {formatNumber(data.processing_time)} {t.analysis.minutes}
                </span>
              </div>
            </OverlayTrigger>
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
