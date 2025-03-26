import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useLanguage } from "../contexts/languageUtils";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Get API URL from environment variables, fallback to window.location.origin
const API_URL = (
  import.meta.env.VITE_API_URL || window.location.origin
).replace(/\/$/, "");

interface FileUploaderProps {
  onUploadSuccess: (jobId: string) => void;
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      setUploadError(null);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        onUploadSuccess(data.job_id);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    onDrop,
    accept: {
      "model/stl": [".stl"],
      "model/step": [".step", ".stp"],
    },
    noClick: false,
    noKeyboard: false,
    disabled: isUploading,
    multiple: false,
  });

  // Determine UI states
  const isFileSelected = acceptedFiles.length > 0;
  const fileName = isFileSelected ? acceptedFiles[0].name : null;

  return (
    <div
      {...getRootProps({
        className: `card border-2 border-dashed p-4 text-center ${
          isDragActive
            ? "border-primary bg-light"
            : isDragReject
            ? "border-danger bg-danger-subtle"
            : isUploading
            ? "border-secondary"
            : isFileSelected
            ? "border-success bg-success-subtle"
            : "border-primary-subtle"
        }`,
        role: "button",
        "aria-label":
          "Upload file area. Drag and drop or click to select a file.",
        tabIndex: 0,
      })}
    >
      <input
        {...getInputProps()}
        type="file"
        accept=".stl,.step,.stp"
        aria-label="File upload input"
        disabled={isUploading}
      />

      <div className="py-4">
        {/* File icon */}
        <div className="mb-3 display-5 text-center">
          {isUploading ? (
            <i className="bi bi-arrow-repeat text-primary"></i>
          ) : isDragActive ? (
            <i className="bi bi-cloud-download text-primary"></i>
          ) : isDragReject ? (
            <i className="bi bi-exclamation-circle text-danger"></i>
          ) : isFileSelected ? (
            <i className="bi bi-check-circle text-success"></i>
          ) : (
            <i className="bi bi-upload text-primary"></i>
          )}
        </div>

        {/* Main prompt text */}
        <h5
          className={`fw-semibold mb-2 ${
            isDragReject
              ? "text-danger"
              : isDragActive
              ? "text-primary"
              : isFileSelected
              ? "text-success"
              : ""
          }`}
        >
          {isUploading ? (
            "Uploading..."
          ) : isDragActive ? (
            t.dropzone.active
          ) : isDragReject ? (
            "File type not supported"
          ) : isFileSelected ? (
            <>
              File selected: <span className="fw-normal fs-6">{fileName}</span>
            </>
          ) : (
            t.dropzone.inactive
          )}
        </h5>

        {/* Format info */}
        {!isUploading && !isFileSelected && (
          <p className="text-secondary small mb-3">
            {t.dropzone.formats} <span className="fw-medium">.stl</span>,{" "}
            <span className="fw-medium">.step</span>,{" "}
            <span className="fw-medium">.stp</span>
          </p>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {uploadError}
          </div>
        )}

        {/* Upload button */}
        {!isUploading && !isFileSelected && (
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={(e) => {
              e.stopPropagation();
              const fileInput = document.querySelector('input[type="file"]');
              if (fileInput) {
                (fileInput as HTMLInputElement).click();
              }
            }}
          >
            <i className="bi bi-upload me-2"></i>
            Browse Files
          </button>
        )}

        {/* Progress indicator */}
        {isUploading && (
          <div className="progress mt-3" style={{ height: "6px" }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              aria-valuenow={75}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: "75%" }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
