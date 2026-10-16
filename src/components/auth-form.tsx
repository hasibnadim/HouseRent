"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowLeft, ArrowRight, House, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"RENTER" | "OWNER">("RENTER");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isRegister) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password, role }),
        });
        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "We could not create your account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError(isRegister ? "Your account was created, but sign in failed. Please log in." : "Email or password is incorrect.");
        if (isRegister) router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="A welcoming liveAir home">
        <Link className="auth-brand" href="/" aria-label="liveAir home">
          <span className="brand-mark"><House size={20} /></span>
          <span>live<span>Air</span></span>
        </Link>
        <div className="auth-visual-copy">
          <span className="eyebrow">A PLACE FOR EVERY CHAPTER</span>
          <h1>Come in.<br /><em>You&apos;re home.</em></h1>
          <p>Find a place to stay, or make space for someone new.</p>
        </div>
        <span className="auth-visual-caption">GOOD HOMES. GOOD PEOPLE.</span>
      </section>

      <section className="auth-panel">
        <Link className="auth-back" href="/">
          <ArrowLeft size={16} /> <span>Back to liveAir</span>
        </Link>
        <div className="auth-form-wrap">
          <span className="auth-icon"><KeyRound size={19} /></span>
          <p className="eyebrow">{isRegister ? "YOUR NEXT CHAPTER" : "WELCOME BACK"}</p>
          <h2>{isRegister ? "Create your account" : "Good to have you back."}</h2>
          <p className="auth-description">
            {isRegister ? "Join liveAir to find a home or welcome your first guest." : "Sign in to pick up right where you left off."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <label className="auth-field">
                  <span>Full name</span>
                  <input autoComplete="name" maxLength={100} onChange={(event) => setName(event.target.value)} required value={name} />
                </label>
                <label className="auth-field">
                  <span>Phone <small>Optional</small></span>
                  <input autoComplete="tel" maxLength={32} onChange={(event) => setPhone(event.target.value)} value={phone} />
                </label>
                <label className="auth-field">
                  <span>I&apos;m joining as</span>
                  <select onChange={(event) => setRole(event.target.value as "RENTER" | "OWNER")} value={role}>
                    <option value="RENTER">Looking for a place</option>
                    <option value="OWNER">Hosting a place</option>
                  </select>
                </label>
              </>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </label>
            <label className="auth-field">
              <span>Password {isRegister && <small>At least 6 characters</small>}</span>
              <input autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 6 : undefined} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button className="auth-submit" disabled={isSubmitting} type="submit">
              <span>{isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Log in"}</span>
              {!isSubmitting && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to liveAir?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create an account"}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}