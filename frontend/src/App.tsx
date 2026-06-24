import AuthPage from "./pages/AuthPage";
import { StatusBarProvider } from "./context/StatusBarContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <StatusBarProvider>
      <Router>
       <Routes>
          <Route path="/" element={<AuthPage />}/>
       </Routes>
      </Router>
    </StatusBarProvider>
  );
}

export default App;