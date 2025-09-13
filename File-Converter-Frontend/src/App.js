import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileConverter from "./FileConverter";
import FileEditorPage from "./FileEditorPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileConverter />} />
        <Route path="/file-editor" element={<FileEditorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
