import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FileConverter = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFiles] = useState(null);
  const [selectedFileType, setSelectedFilesType] = useState("select");
  const [pdfSize, setPdfSize] = useState("select");
  const [convertedFile, setConvertedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [compress, setCompress] = useState("low");

  const handleEditFile = () => {
    navigate("/file-editor", {
      state: {
        filePath: convertedFile,
      },
    });
  };

  function convertFiles() {
    if (
      !selectedFile ||
      selectedFileType === "" ||
      selectedFileType === "select"
    ) {
      alert("Please select a file and valid format");
      return;
    }

    setIsConverting(true);
    const formData = new FormData();
    formData.append("files", selectedFile);
    formData.append("compress", compress);
    formData.append("convertFileType", selectedFileType);
    if (selectedFileType === "pdf") {
      formData.append("pdfFileSize", pdfSize);
    }

    fetch("http://localhost:6100/convert", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setConvertedFile(data.filePath);
      })
      .catch(console.error)
      .finally(() => setIsConverting(false));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white text-center">
            File Converter
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Choose a file
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center pt-8 pb-6">
                  <svg
                    className="w-10 h-10 mb-3 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-indigo-700">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-indigo-500">
                    {selectedFile
                      ? selectedFile.name
                      : "Supports all document formats"}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFiles(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {/* Compression Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Compression Level
            </label>
            <div className="flex gap-4">
              {["low", "medium", "high"].map((size) => (
                <label key={size} className="flex items-center gap-1">
                  <input
                    type="radio"
                    value={size}
                    checked={compress === size}
                    onChange={() => setCompress(size)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {size}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Conversion Options */}
          {selectedFile && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 gap-4">
                {/* Format Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Convert to format
                  </label>
                  <select
                    value={selectedFileType}
                    onChange={(e) => setSelectedFilesType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                  >
                    <option value="select">Select output format</option>
                    <option value="pdf">PDF Document</option>
                    <option value="jpg">JPEG Image</option>
                    <option value="png">PNG Image</option>
                    <option value="webp">WebP Image</option>
                    <option value="doc">Word Document</option>
                  </select>
                </div>

                {/* PDF Size Selector */}
                {selectedFileType === "pdf" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Page size
                    </label>
                    <select
                      value={pdfSize}
                      onChange={(e) => setPdfSize(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    >
                      <option value="select">Select page size</option>
                      <option value="A4">A4 (210 × 297 mm)</option>
                      <option value="Letter">Letter (8.5 × 11 in)</option>
                      <option value="Legal">Legal (8.5 × 14 in)</option>
                      <option value="A5">A5 (148 × 210 mm)</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={convertFiles}
                disabled={
                  isConverting ||
                  selectedFileType === "select" ||
                  (selectedFileType === "pdf" && pdfSize === "select")
                }
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 ${
                  isConverting ||
                  selectedFileType === "select" ||
                  (selectedFileType === "pdf" && pdfSize === "select")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isConverting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Converting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                    Convert File
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results Section */}
          {convertedFile && (
            <div className="animate-fadeIn space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      File converted successfully!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`http://localhost:6100${convertedFile}`}
                  download
                  className="flex-1 flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </a>
                <button
                  onClick={handleEditFile}
                  className="flex-1 flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileConverter;
