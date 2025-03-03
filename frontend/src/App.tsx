import { useState, useEffect } from "react";
import { FileUploader } from "./components/FileUploader";
import { ConversionStatus } from "./components/ConversionStatus";
import { GeometryAnalysis } from "./components/GeometryAnalysis";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useLanguage } from "./contexts/languageUtils";
import { LanguageSwitch } from "./components/LanguageSwitch";
import { UploadStatus } from "./components/UploadStatus";
import "./App.css";
import { usePostHog } from "posthog-js/react";

// Get API URL from environment variables, fallback to window.location.origin
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

interface GeometryData {
  volume?: number;
  surface_area?: number;
  center_of_mass?: number[];
  processing_time?: number;
  error?: string;
  units?: string;
}

interface ConversionData {
  status: string;
  error?: string;
  geometry?: GeometryData;
  converted_geometry?: GeometryData;
}

function MainContent() {
  const { t } = useLanguage();
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);
  const [convertedGeometry, setConvertedGeometry] =
    useState<GeometryData | null>(null);

  useEffect(() => {
    if (!jobId || status === "completed" || status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/conversion/${jobId}`);
        const data: ConversionData = await response.json();

        setStatus(data.status);
        if (data.error) setError(data.error);
        if (data.converted_geometry)
          setConvertedGeometry(data.converted_geometry);
      } catch (e) {
        console.error("Error checking status:", e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jobId, status]);

  // Function to reset all states
  const handleReset = () => {
    setJobId(null);
    setStatus("idle");
    setError(null);
    setConvertedGeometry(null);
  };

  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("my event", { property: "value" });
  }, []);

  return (
    <div className="main-content">
      {/* Language Switch - Fixed position */}
      <div className="fixed">
        <LanguageSwitch />
      </div>

      {/* Hero Section - Reduced padding */}
      <div className="hero-section py-8">
        <div className="hero-content">
          <h1 className="hero-title text-3xl">{t.companyInfo.name}</h1>
          <h2 className="hero-subtitle text-2xl">{t.title}</h2>
          <p className="hero-subtitle">{t.subtitle}</p>
        </div>
      </div>

      {/* Features Section - Reduced spacing */}
      <div className="features-section py-6">
        <div className="container">
          <h2 className="text-2xl mb-8 text-center">{t.features.title}</h2>
          <div className="features-grid gap-4">
            <div className="feature-card p-4">
              <div className="feature-icon mb-2">⚡️</div>
              <h3 className="text-lg mb-1">{t.features.quality.title}</h3>
              <p className="text-center text-sm">
                {t.features.quality.description}
              </p>
            </div>
            <div className="feature-card p-4">
              <div className="feature-icon mb-2">🚀</div>
              <h3 className="text-lg mb-1">{t.features.speed.title}</h3>
              <p className="text-center text-sm">
                {t.features.speed.description}
              </p>
            </div>
            <div className="feature-card p-4">
              <div className="feature-icon mb-2">🛠️</div>
              <h3 className="text-lg mb-1">{t.features.materials.title}</h3>
              <p className="text-center text-sm">
                {t.features.materials.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section - Reduced spacing */}
      <section className="upload-section mt-4">
        <div className="card">
          <div className="card-content p-4">
            <h2 className="text-xl mb-2 text-center">{t.uploadTitle}</h2>
            <p className="text-center text-sm mb-4">{t.uploadDescription}</p>

            <div className="w-full flex justify-center mb-4">
              {!(status === "completed" || status === "failed") && (
                <FileUploader onUploadSuccess={setJobId} />
              )}
            </div>

            {jobId && (
              <div className="w-full border-t pt-4 flex flex-col items-center text-center">
                <div className="w-full max-w-md text-center">
                  <ConversionStatus status={status} error={error} />
                  {(status === "completed" || status === "failed") && (
                    <UploadStatus status={status} onReset={handleReset} />
                  )}
                </div>
              </div>
            )}

            {convertedGeometry && (
              <div className="w-full border-t pt-4 flex flex-col items-center">
                <h3 className="text-lg mb-2">{t.analysis.convertedGeometry}</h3>
                <GeometryAnalysis data={convertedGeometry} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Company Info Section */}
      <section className="bg-gray-50 py-4 mt-4">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t.companyInfo.name}</h2>
            <div className="space-y-2 text-gray-600">
              <p>
                <a
                  href={`mailto:${t.companyInfo.email}`}
                  className="hover:text-blue-600"
                >
                  ✉️ {t.companyInfo.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${t.companyInfo.phone}`}
                  className="hover:text-blue-600"
                >
                  📞 {t.companyInfo.phone}
                </a>
              </p>
              <p>📍 {t.companyInfo.address}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
}
