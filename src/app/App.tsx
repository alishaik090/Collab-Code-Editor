import { Routes, Route, Navigate } from "react-router-dom";
import JoinRoom from "./pages/JoinRoom";
import Editor from "./pages/Editor";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinRoom />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
