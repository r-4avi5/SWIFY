import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Field from "../../components/common/Field";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import "./AuthForm.css";

const initialForm = {
  fullName: "",
  displayName: "",
  email: "",
  phone: "",
  swifyId: "",
  password: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => {
    let value = e.target.value;
    if (key === "swifyId") value = value.toLowerCase().replace(/\s+/g, "");
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.displayName.length > 12) {
      setError("Display name must be 12 characters or fewer.");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your Swify account"
      tagline="Set up a wallet, a pay address, and a swifyId people can send to."
    >
      <motion.form
        className="auth-form"
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-form__grid">
          <Field label="Full name">
            <input
              className="input"
              required
              placeholder="Rhea Kapoor"
              value={form.fullName}
              onChange={update("fullName")}
              autoComplete="name"
            />
          </Field>
          <Field label="Display name" hint="Shown to people you pay · max 12 chars">
            <input
              className="input"
              required
              maxLength={12}
              placeholder="Rhea"
              value={form.displayName}
              onChange={update("displayName")}
            />
          </Field>
        </div>

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

        <div className="auth-form__grid">
          <Field label="Phone">
            <input
              className="input"
              required
              placeholder="98765 43210"
              value={form.phone}
              onChange={update("phone")}
              autoComplete="tel"
            />
          </Field>
          <Field label="swifyId" hint="Your unique handle">
            <input
              className="input mono"
              required
              placeholder="rhea.k"
              value={form.swifyId}
              onChange={update("swifyId")}
            />
          </Field>
        </div>

        <Field label="Password" hint="At least 6 characters">
          <input
            className="input"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            value={form.password}
            onChange={update("password")}
            autoComplete="new-password"
          />
        </Field>

        {error ? <p className="auth-form__error">{error}</p> : null}

        <Button type="submit" size="lg" loading={loading} className="auth-form__submit">
          <UserPlus size={17} /> Create account
        </Button>

        <p className="auth-form__switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
