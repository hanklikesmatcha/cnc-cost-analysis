import { useLanguage } from "../contexts/languageUtils";

interface ConversionStatusProps {
  status: string;
  error: string | null;
}

export function ConversionStatus({ status, error }: ConversionStatusProps) {
  const { t } = useLanguage();

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "processing":
        return "text-blue-600";
      default:
        return "text-gray-600";
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
    <div className="w-full flex justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-gray-700 font-medium">{t.status.title}</div>
          <div className={`font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
            <div className="font-medium text-red-600 mb-1">
              {t.status.error}
            </div>
            <div className="text-red-600">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
