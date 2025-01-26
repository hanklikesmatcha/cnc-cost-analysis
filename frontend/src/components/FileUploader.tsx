import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useLanguage } from "../contexts/languageUtils";

// Get API URL from environment variables, fallback to window.location.origin
const API_URL = (
  import.meta.env.VITE_API_URL || window.location.origin
).replace(/\/$/, "");

interface FileUploaderProps {
  onUploadSuccess: (jobId: string) => void;
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const { t } = useLanguage();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

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
        alert("Failed to upload file. Please try again.");
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/stl": [".stl"],
      "model/step": [".step", ".stp"],
    },
    noClick: false,
    noKeyboard: false,
    disabled: false,
    multiple: false,
    onDragEnter: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
    },
    onDragOver: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
    },
    onDragLeave: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
    },
  });

  return (
    <div
      {...getRootProps({
        className: `relative overflow-hidden transition-all duration-300 rounded-xl p-12 min-h-[240px] flex flex-col justify-center text-center cursor-pointer bg-gray-50 ${
          isDragActive ? "bg-blue-50" : "hover:bg-gray-100"
        }`,
      })}
    >
      <input {...getInputProps()} type="file" accept=".stl,.step,.stp" />
      <div className="space-y-4">
        <p className="text-xl font-medium">
          {isDragActive ? t.dropzone.active : t.dropzone.inactive}
        </p>
        <p className="text-sm text-gray-500">
          {t.dropzone.formats} <span className="font-medium">.stl</span>,{" "}
          <span className="font-medium">.step</span>,{" "}
          <span className="font-medium">.stp</span>
        </p>
      </div>
    </div>
  );
}
