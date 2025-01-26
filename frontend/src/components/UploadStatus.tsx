import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

interface UploadStatusProps {
  status: string;
  onReset: () => void;
}

export function UploadStatus({ onReset }: UploadStatusProps) {
  return (
    <div className="w-full text-center mt-4">
      <button
        onClick={onReset}
        className="btn btn-primary d-flex align-items-center gap-2 mx-auto"
      >
        <i className="bi bi-arrow-clockwise"></i>
        Refresh
      </button>
    </div>
  );
}
