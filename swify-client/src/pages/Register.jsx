import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import Field, { inputClass } from "../components/Field";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

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
        className="flex flex-col gap-[18px]"
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid grid-cols-2 gap-[18px] max-[520px]:grid-cols-1">
          <Field label="Full name">
            <input
              className={inputClass}
              required
              placeholder="Rhea Kapoor"
              value={form.fullName}
              onChange={update("fullName")}
              autoComplete="name"
            />
          </Field>
          <Field label="Display name" hint="Shown to people you pay · max 12 chars">
            <input
              className={inputClass}
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
            className={inputClass}
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
          />
        </Field>

        <div className="grid grid-cols-2 gap-[18px] max-[520px]:grid-cols-1">
          <Field label="Phone">
            <input
              className={inputClass}
              required
              placeholder="98765 43210"
              value={form.phone}
              onChange={update("phone")}
              autoComplete="tel"
            />
          </Field>
          <Field label="swifyId" hint="Your unique handle">
            <input
              className={`${inputClass} font-mono`}
              required
              placeholder="rhea.k"
              value={form.swifyId}
              onChange={update("swifyId")}
            />
          </Field>
        </div>

        <Field label="Password" hint="At least 6 characters">
          <input
            className={inputClass}
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            value={form.password}
            onChange={update("password")}
            autoComplete="new-password"
          />
        </Field>

        {error ? (
          <p className="m-0 px-3.5 py-2.5 rounded-[10px] bg-coral-soft text-coral text-sm font-semibold">{error}</p>
        ) : null}

        <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
          <UserPlus size={17} /> Create account
        </Button>

        <p className="text-center text-[0.86rem] text-slate m-0 mt-1">
          Already have an account? <Link to="/login" className="text-brass-soft font-bold">Sign in</Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
