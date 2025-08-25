import { useParams, Navigate } from "react-router-dom";

const Landing = () => {
  const { companyId } = useParams();
  
  // Redirect to the new simplified company upload route
  return <Navigate to={`/company/${companyId}`} replace />;
};

export default Landing;