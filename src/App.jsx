import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import JoinChannelPage from "./pages/JoinChannelPage.jsx";
import CreateChannelPage from "./pages/CreateChannelPage.jsx";
import ChannelMessagingPage from "./pages/ChannelMessagingPage.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/join-channel" replace />} />

        <Route path="/join-channel" element={<JoinChannelPage />} />

        <Route path="/create-channel" element={<CreateChannelPage />} />

        <Route path="/channel/:channelId" element={<ChannelMessagingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
