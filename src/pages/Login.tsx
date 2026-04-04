// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home, Mail, Lock, User, Phone,
  AlertCircle, CheckCircle, Loader2, Eye, EyeOff,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

// ── Types ────────────────────────────────────────────────────────────────────
interface Fields {
  name: string;
  phone: string;
  email: string;
  password: string;
}

type FieldErrors = Partial<Record<keyof Fields, string>>;

// ── Validation ───────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\s\-()]{8,15}$/;

function validate(fields: Fields, isSignUp: boolean): FieldErrors {
  const errors: FieldErrors = {};

  if (isSignUp) {
    if (!fields.name.trim()) errors.name = "Le nom est requis.";
    else if (fields.name.trim().length < 2) errors.name = "Au moins 2 caractères.";

    if (!fields.phone.trim()) errors.phone = "Le téléphone est requis.";
    else if (!PHONE_RE.test(fields.phone)) errors.phone = "Numéro invalide.";
  }

  if (!fields.email.trim()) errors.email = "L'email est requis.";
  else if (!EMAIL_RE.test(fields.email)) errors.email = "Email invalide.";

  if (!fields.password) errors.password = "Le mot de passe est requis.";
  else if (fields.password.length < 6) errors.password = "6 caractères minimum.";

  return errors;
}

// ── Field component ──────────────────────────────────────────────────────────
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ElementType;
  error?: string;
}

function Field({ icon: Icon, error, ...props }: FieldProps) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = props.type === "password";

  return (
    <div className="space-y-1">
      <div
        className={`relative transition-all duration-200 ${
          error ? "ring-2 ring-red-400/60 rounded-xl" : ""
        }`}
      >
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          {...props}
          type={isPassword && showPwd ? "text" : props.type}
          className="h-11 w-full rounded-xl bg-secondary pl-10 pr-10 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/30"
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, login } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [fields, setFields] = useState<Fields>({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
    setGlobalError("");
  };

  const switchMode = () => {
    setIsSignUp((v) => !v);
    setFieldErrors({});
    setGlobalError("");
    setSuccess("");
    setFields({ name: "", phone: "", email: "", password: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setSuccess("");

    const errors = validate(fields, isSignUp);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    if (isSignUp) {
      const result = register(fields);
      if (!result.success) {
        setGlobalError(result.error ?? "Erreur lors de l'inscription.");
        setLoading(false);
        return;
      }
      setSuccess("Compte créé avec succès ! Redirection…");
    } else {
      const result = login(fields);
      if (!result.success) {
        setGlobalError(result.error ?? "Identifiants incorrects.");
        setLoading(false);
        return;
      }
      setSuccess("Connexion réussie ! Redirection…");
    }

    setLoading(false);
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
    setTimeout(() => navigate(from, { replace: true }), 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex items-center justify-center py-16">
        <div
          className="w-full max-w-sm rounded-2xl bg-card p-6"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          {/* Logo */}
          <Link to="/" className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl text-foreground">
              Ivoire<span className="text-accent">Immobilier</span>
            </span>
          </Link>

          {/* Heading */}
          <h1 className="text-center font-display text-xl text-foreground">
            {isSignUp ? "Créer un compte" : "Connexion"}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {isSignUp ? "Rejoignez la communauté" : "Accédez à votre espace"}
          </p>

          {/* Global feedback */}
          {globalError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {globalError}
            </div>
          )}
          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-sm text-green-600">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Form */}
          <form className="mt-5 space-y-3" onSubmit={handleSubmit} noValidate>
            {isSignUp && (
              <>
                <Field
                  icon={User}
                  type="text"
                  placeholder="Nom complet"
                  value={fields.name}
                  onChange={set("name")}
                  error={fieldErrors.name}
                  autoComplete="name"
                />
                <Field
                  icon={Phone}
                  type="tel"
                  placeholder="Téléphone (ex: +225 07 00 00 00)"
                  value={fields.phone}
                  onChange={set("phone")}
                  error={fieldErrors.phone}
                  autoComplete="tel"
                />
              </>
            )}

            <Field
              icon={Mail}
              type="email"
              placeholder="Email"
              value={fields.email}
              onChange={set("email")}
              error={fieldErrors.email}
              autoComplete="email"
            />
            <Field
              icon={Lock}
              type="password"
              placeholder="Mot de passe"
              value={fields.password}
              onChange={set("password")}
              error={fieldErrors.password}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-accent hover:underline"
                  onClick={() => alert("Fonctionnalité de récupération à venir.")}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isSignUp ? "Création…" : "Connexion…"}
                </>
              ) : isSignUp ? (
                "Créer mon compte"
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
            <button onClick={switchMode} className="font-medium text-accent hover:underline">
              {isSignUp ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}