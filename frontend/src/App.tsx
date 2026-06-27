import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/ChatPage";
import { StatusBarProvider } from "./context/StatusBarContext";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <StatusBarProvider>
      <AuthProvider>
      <Router>
       <Routes>
          <Route path="/" element={<AuthPage />}/>
          <Route path="/feed" element={<FeedPage />} />
       </Routes>
      </Router>
      </AuthProvider>
    </StatusBarProvider>
  );
}

export default App;