import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import Field, { inputClass } from "../components/Field";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

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
        className="flex flex-col gap-[18px]"
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {location.state?.registered ? (
          <p className="m-0 px-3.5 py-2.5 rounded-[10px] bg-signal-soft text-signal text-sm font-semibold">
            Account created. Sign in to continue.
          </p>
        ) : null}

        <Field label="Email">
          <input
            className={inputClass}
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
            className={inputClass}
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={update("password")}
            autoComplete="current-password"
          />
        </Field>

        {error ? (
          <p className="m-0 px-3.5 py-2.5 rounded-[10px] bg-coral-soft text-coral text-sm font-semibold">{error}</p>
        ) : null}

        <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
          <LogIn size={17} /> Sign in
        </Button>

        <p className="text-center text-[0.86rem] text-slate m-0 mt-1">
          New to Swify? <Link to="/register" className="text-brass-soft font-bold">Create an account</Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
