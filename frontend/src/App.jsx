import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Covoiturages from "./pages/Covoiturages";
// import Dashboard from "./pages/Dashboard";
// import Login from "./pages/Login";
import Register from "./pages/Register";
import Acceuil from "./pages/Acceuil";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Acceuil />} />
        {/* <Route path="/covoiturages" element={<Covoiturages />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} /> */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
