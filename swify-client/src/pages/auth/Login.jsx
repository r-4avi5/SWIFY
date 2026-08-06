import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Field from "../../components/common/Field";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import "./AuthForm.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to Swify"
      tagline="Enter your account details to reach your wallet."
    >
      <motion.form
        className="auth-form"
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {location.state?.registered ? (
          <p className="auth-form__notice">Account created. Sign in to continue.</p>
        ) : null}

        <Field label="Email">
          <input
            className="input"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
          />
        </Field>

        <Field label="Password">
          <input
            className="input"
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={update("password")}
            autoComplete="current-password"
          />
        </Field>

        {error ? <p className="auth-form__error">{error}</p> : null}

        <Button type="submit" size="lg" loading={loading} className="auth-form__submit">
          <LogIn size={17} /> Sign in
        </Button>

        <p className="auth-form__switch">
          New to Swify? <Link to="/register">Create an account</Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
