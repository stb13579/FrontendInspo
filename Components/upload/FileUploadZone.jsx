import React, { useCallback } from "react";
import { Upload, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FileUploadZone({ onFileUpload }) {
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
        dragActive 
          ? "border-blue-400 bg-blue-50" 
          : "border-slate-300 hover:border-slate-400"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
          <Upload className="w-8 h-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">
            Upload Amplitude Export
          </h3>
          <p className="text-sm text-slate-500">
            Drag and drop your file here, or click to browse
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            CSV
          </div>
          <div className="flex items-center gap-1">
            <Database className="w-4 h-4" />
            JSON
          </div>
        </div>

        <Button
          onClick={handleBrowseClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Browse Files
        </Button>
      </div>
    </div>
  );
}