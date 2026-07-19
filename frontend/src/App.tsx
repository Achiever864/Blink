import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import { StatusBarProvider } from "./context/StatusBarContext";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MessagePage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import FriendPage from "./pages/FriendPage";
import SettingsPage from "./pages/SettingsPage";
import { ThemeProvider } from "./context/ThemeContext";
import NotificationsPage from "./pages/Notification";
import ReelsPage from "./pages/ReelsPage";

function App() {
  return (
    <Router>
      <ThemeProvider>
      <StatusBarProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/message" element={<MessagePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/friends" element={<FriendPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />  
            <Route path="/reels" element={<ReelsPage />} />
            </Routes>  
        </AuthProvider>
      </StatusBarProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;