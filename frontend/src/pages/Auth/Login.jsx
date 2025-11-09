import { useState } from "react";
import { api, setAuth } from "../../services/api";
import Button from "../../components/Button";
import { Link, useNavigate } from 'react-router-dom'

export default function Login({ toast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem('email', data.user.email || email)

      toast("Logged in successfully", "success");
      if (data.user.role === 'admin') navigate('/admin', { replace: true })
      else if (data.user.role === 'owner') navigate('/owner', { replace: true })
      else navigate('/user', { replace: true })

    } catch (e) {
      toast(e?.response?.data?.error || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Login</h2>
      <form
        onSubmit={submit}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <input
          className="w-full border p-3 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border p-3 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </Button>
      </form>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <Link to="/signup">Create an account</Link>
        <Link to="/forgot">Forgot password?</Link>
      </div>
    </div>
  );
}
