import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import { StatusBarProvider } from "./context/StatusBarContext";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MessagePage from "./pages/MessagesPage";

function App() {
  return (
    <Router>
      <StatusBarProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthPage />}/>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/message" element={<MessagePage />} />
          </Routes>  
        </AuthProvider>
      </StatusBarProvider>
    </Router>
  );
}

export default App;