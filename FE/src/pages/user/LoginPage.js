import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Container, Spinner } from "react-bootstrap";
import { loginUser } from "../../api/authApi";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      navigate(user.isAdmin ? "/admin" : "/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginUser({ email, password }, navigate);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <Container style={{ marginBottom: 25 }}>
      <div className="d-flex align-items-center justify-content-center">
        <div className="card p-4 shadow-sm w-100" style={{ maxWidth: "600px" }}>
          <h2 className="text-center mb-4">Login to CarSupper</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group mt-2">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="text-end mt-2">
              <Link
                to="/forgot-password"
                className="text-primary text-decoration-none"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Login"}
            </button>
          </form>
          <p className="text-center mt-3">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
};

export default LoginPage;
