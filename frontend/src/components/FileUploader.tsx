import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useLanguage } from "../contexts/languageUtils";

interface FileUploaderProps {
  onUploadSuccess: (jobId: string) => void;
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const { t } = useLanguage();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setUploadError(null);

      if (rejectedFiles.length > 0) {
        setUploadError("Please upload a valid CAD file (.stl, .step, .iges)");
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/api/upload", {
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
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/x-step": [".step", ".stp"],
      "application/x-iges": [".iges", ".igs"],
      "application/x-stl": [".stl"],
    },
    multiple: false,
    onDragEnter: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDragOver: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDragLeave: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative overflow-hidden transition-all duration-300 rounded-xl p-12 min-h-[240px] flex flex-col justify-center text-center cursor-pointer bg-gray-50
          ${isDragActive ? "bg-blue-50" : "hover:bg-gray-100"}
          ${uploadError ? "bg-red-50" : ""}
        `}
      >
        <input {...getInputProps()} className="hidden" />
        <div className="space-y-4">
          <div className="flex justify-center items-center">
            <br />
          </div>
          <p className="text-xl font-medium">
            {isDragActive ? t.dropzone.active : t.dropzone.inactive}
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: <span className="font-medium">.stl</span>,{" "}
            <span className="font-medium">.step</span>,{" "}
            <span className="font-medium">.iges</span>
          </p>
        </div>
        {/* Animated gradient background on hover */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-100 via-white to-blue-100 opacity-0 hover:opacity-100 transition-opacity duration-300 animate-gradient" />
      </div>

      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {uploadError}
        </div>
      )}
    </div>
  );
}
