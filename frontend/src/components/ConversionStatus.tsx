import { useLanguage } from "../contexts/languageUtils";
import "bootstrap/dist/css/bootstrap.min.css";

interface ConversionStatusProps {
  status: string;
  error: string | null;
}

export function ConversionStatus({ status, error }: ConversionStatusProps) {
  const { t } = useLanguage();

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "danger";
      case "processing":
        return "info";
      default:
        return "secondary";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "completed":
        return t.status.completed;
      case "failed":
        return t.status.failed;
      case "processing":
        return t.status.processing;
      default:
        return status;
    }
  };

  return (
    <div
      className="toast show mx-auto"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast-header">
        <div
          className={`rounded-circle me-2 bg-${getStatusColor()}`}
          style={{ width: "20px", height: "20px" }}
        ></div>
        <strong className="me-auto">{t.status.title}</strong>
      </div>
      <div className={`toast-body text-${getStatusColor()}`}>
        {getStatusText()}
        {error && <div className="mt-2 small text-danger">{error}</div>}
      </div>
    </div>
  );
}
