
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Dashboard
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-blue mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Loading SmartMed</h1>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
};

export default Index;
