import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const FileEditorPage = () => {
  const { state } = useLocation();
  const filePath = state?.filePath || "";
  const pdfUrl = `http://localhost:6100${filePath}`;
  const navigate = useNavigate();
  const [image, setImage] = useState("");
  const [text, setText] = useState({
    textFont: "Times-Roman",
    textContent: "",
    textAlign: "left",
  });
  const [newPdfUrl, setNewPdfUrl] = useState("");
  const [selectLang, setSelectLang] = useState("hi-IN");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName] = useState(filePath.split("/").pop() || "document.pdf");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in your browser");
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.lang = selectLang;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");

    setText((prev) => ({ ...prev, textContent: transcript }));
  };

  function startRecognition() {
    recognition.lang = selectLang;
    recognition.start();
  }

  function stopRecognition() {
    recognition.stop();
  }

  useEffect(() => {
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        let finalText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str);
          finalText += strings.join(" ") + "\n\n";
        }

        setText({ ...text, textContent: finalText });
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (pdfUrl) loadPdf();
  }, [pdfUrl]);

  const handleSave = () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("text", JSON.stringify(text));

    fetch("http://localhost:6100/newPdf", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setNewPdfUrl(`http://localhost:6100${data.filePath}`);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-indigo-700 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-indigo-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-xl font-medium">{fileName}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              isLoading
                ? "bg-indigo-400"
                : "bg-white text-indigo-700 hover:bg-gray-100"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                <span>Save</span>
              </>
            )}
          </button>
          {newPdfUrl && (
            <a
              href={newPdfUrl}
              download={fileName.replace(".pdf", "-edited.pdf")}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
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
              <span>Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="bg-gray-100 px-6 py-3 border-b flex flex-wrap items-center gap-4">
        {/* Font Selection */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="fontSelect"
            className="text-sm font-medium text-gray-700"
          >
            Font:
          </label>
          <select
            id="fontSelect"
            value={text.textFont}
            onChange={(e) => setText({ ...text, textFont: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value="Times-Roman">Times-Roman</option>
            <option value="Times-Bold">Times-Bold</option>
            <option value="Times-Italic">Times-Italic</option>
            <option value="Times-BoldItalic">Times-BoldItalic</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Helvetica-Bold">Helvetica-Bold</option>
            <option value="Helvetica-Oblique">Helvetica-Oblique</option>
            <option value="Helvetica-BoldOblique">Helvetica-BoldOblique</option>
            <option value="Courier">Courier</option>
            <option value="Courier-Bold">Courier-Bold</option>
            <option value="Courier-Oblique">Courier-Oblique</option>
            <option value="Courier-BoldOblique">Courier-BoldOblique</option>
            <option value="Symbol">Symbol</option>
            <option value="ZapfDingbats">ZapfDingbats</option>
          </select>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Alignment:</span>
          <div className="flex space-x-2">
            {["left", "center", "right"].map((alignment) => (
              <label key={alignment} className="flex items-center space-x-1">
                <input
                  type="radio"
                  value={alignment}
                  checked={text.textAlign === alignment}
                  onChange={(e) =>
                    setText({ ...text, textAlign: e.target.value })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {alignment}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Image upload */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            Add Image:
          </label>
          <label className="relative cursor-pointer bg-white rounded-md border border-gray-300 shadow-sm px-3 py-2 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg
              className="w-5 h-5 mr-2 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="sr-only"
            />
          </label>
          {image && (
            <span className="text-sm text-green-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
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
              Selected
            </span>
          )}
        </div>

        {/* Voice Typing Section */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            Voice Type:
          </label>
          <div className="flex items-center space-x-2 bg-white rounded-md border border-gray-300 p-1">
            <button
              onClick={startRecognition}
              className="p-1 text-green-600 hover:bg-green-50 rounded-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              onClick={stopRecognition}
              className="p-1 text-red-600 hover:bg-red-50 rounded-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <select
              id="languageSelect"
              value={selectLang}
              onChange={(e) => setSelectLang(e.target.value)}
              className="text-sm border-none focus:ring-0 focus:border-none"
            >
              <option value="en-US">English (US)</option>
              <option value="en-IN">Roman Hindi (India)</option>
              <option value="hi-IN">Hindi (India)</option>
              <option value="fr-FR">French</option>
              <option value="es-ES">Spanish</option>
              <option value="de-DE">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Editor Area */}
      <div className="flex-1 bg-white p-8 mx-auto w-full max-w-4xl">
        <div className="bg-white shadow-sm border rounded-lg h-full">
          <div className="p-6 min-h-[80vh]">
            <textarea
              value={text.textContent}
              onChange={(e) =>
                setText({ ...text, textContent: e.target.value })
              }
              className="w-full h-full p-4 text-gray-800 text-base border-none focus:outline-none resize-none"
              placeholder={
                isLoading
                  ? "Extracting text from PDF..."
                  : "Start typing your document here..."
              }
              disabled={isLoading}
              style={{
                fontFamily: text.textFont,
                textAlign: text.textAlign,
                lineHeight: "1.6",
                minHeight: "60vh",
              }}
            />
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
            {text.textContent.length} characters |{" "}
            {text.textContent.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEditorPage;
