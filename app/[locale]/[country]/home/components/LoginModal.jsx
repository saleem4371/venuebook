"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import lightLogo  from "@/assets/logo.svg";
import darkLogo   from "@/assets/logo.png";
import loginBg    from "@/assets/loginbackground.png";

import { loginApi, registerApi, sendOtpApi, verifyOtpApi, socialLoginApi ,
   getUserApi ,forgotPasswordApi  ,resetPasswordApi} from "@/services/auth.service";
import { validateEmail, validatePassword, validatePhone, validateOtp } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";

import { useAuth } from "@/context/AuthContext";

/* ─────────────────────────────────────────────────────────────────── */
/*  LoginModal                                                          */
/* ─────────────────────────────────────────────────────────────────── */

export default function LoginModal({ open, setOpen }) {
  const [mode, setMode] = useState("login"); // login | register | phone
const [user, setUser] = useState("");
const [phone, setPhone] = useState("");
const [step, setStep] = useState("number"); // number | otp // 
const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const close = () => setOpen(false);

  const [fpEmail, setFpEmail] = useState("");
const [fpStep, setFpStep] = useState("email"); // email | sent

    const { login, fetchUser } = useAuth(); 

  /* Strict body scroll lock */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ESC to close */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Reset mode when reopened */
  useEffect(() => { if (open) setMode("login"); }, [open]);

  // Login 

  const router = useRouter();

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  cpassword: "",
});



const handleLogin = async () => {
  setError("");

  if (!validateEmail(form.email)) return setError("Invalid email");
  if (!validatePassword(form.password)) return setError("Password must be 6+ chars");

  try {
    setLoading(true);

    const res = await loginApi({
      email: form.email,
      password: form.password,
    });

    document.cookie = `token=${res.data.access_token}; path=/`;
   await fetchUser();
    close();
    router.push("/");

  } catch (err) {
    setError(err?.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};


const handleRegister = async () => {
  setError("");

  if (!form.name) return setError("Name required");
  if (!validateEmail(form.email)) return setError("Invalid email");
  if (!validatePassword(form.password)) return setError("Weak password");
  if (form.password !== form.cpassword) return setError("Passwords not match");

  try {
    setLoading(true);

    await registerApi({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    setMode("login");

  } catch (err) {
    console.log(err)
    setError(err?.response?.data?.message || "Register failed");
  } finally {
    setLoading(false);
  }
};


const handleSendOtp = async () => {
  setError("");

  if (!validatePhone(phone)) return setError("Invalid phone");

  try {
    setLoading(true);
    await sendOtpApi(phone);
    setStep("otp");
  } catch (err) {
    setError("Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

const handleVerifyOtp = async () => {
  setError("");

  // if (!validateOtp(otp)) return setError("Invalid OTP");
  if (!validateOtp(otp.join(""))) return setError("Invalid OTP");

  try {
    setLoading(true);

    const res = await verifyOtpApi({
      phone,
      otp: otp.join(""),
    });

    document.cookie = `token=${res.data.access_token}; path=/`;
   await fetchUser();
    close();
    router.push("/");

  } catch (err) {
    setError("OTP verification failed");
  } finally {
    setLoading(false);
  }
};

const handleSocialLogin = async (provider) => {
  try {
    setLoading(true);

    // later replace with real OAuth token
    const fakeToken = "google-facebook-token";

    const res = await socialLoginApi(provider, fakeToken);

    document.cookie = `token=${res.data.access_token}; path=/`;
   await fetchUser();
    close();
    router.push("/");

  } catch (err) {
    setError("Social login failed");
  } finally {
    setLoading(false);
  }
};

//gOOGLE LOGIN
const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      setLoading(true);

      const accessToken = tokenResponse.access_token;
      

      const res = await socialLoginApi("google", accessToken);

      document.cookie = `token=${res.data.access_token}; path=/`;

      close();
      router.push("/profile");

    } catch (err) {
      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  },
  onError: () => {
    setError("Google login cancelled");
  },
});

const handleForgotEmail = async () => {
  setError("");

  if (!validateEmail(fpEmail)) return setError("Invalid email");

  try {
    setLoading(true);

    await forgotPasswordApi({ email: fpEmail });

    setFpStep("sent");
  } catch {
    setError("Failed to send email");
  } finally {
    setLoading(false);
  }
};
const handleResetPassword = async () => {
  setError("");

  const otpValue = otp.join("");

  if (otpValue.length !== 6) {
    return setError("Enter complete OTP");
  }

  if (!validateOtp(otpValue)) {
    return setError("Invalid OTP");
  }

  if (!validatePassword(form.password)) {
    return setError("Weak password");
  }

  if (form.password !== form.cpassword) {
    return setError("Passwords do not match");
  }

  try {
    setLoading(true);

    await resetPasswordApi({
      email: fpEmail,
      otp: otpValue,
      password: form.password,
    });

    setFpStep("success");
  } catch (err) {
    console.log(err)
    setError(err?.response?.data?.message || "Reset failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="login-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            key="login-panel"
            role="dialog"
            aria-modal="true"
            aria-label={mode === "register" ? "Create account" : "Sign in"}
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "fixed left-1/2 top-1/2 z-[110]",
              "-translate-x-1/2 -translate-y-1/2",
              "w-[calc(100%-2rem)] max-w-[960px]",
              "max-h-[90vh]",
              "rounded-2xl overflow-hidden",
              "bg-white dark:bg-gray-900",
              "shadow-2xl shadow-black/25 dark:shadow-black/70",
              "flex",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Left image panel (desktop only) ─────────── */}
            <div className="hidden md:flex w-[45%] relative shrink-0 flex-col">
              {/* Background image */}
              <img
                src={loginBg.src ?? loginBg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                draggable="false"
              />
              {/* Violet tint overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-black/60 to-black/70" />

              {/* Content layer */}
              <div className="relative z-10 flex flex-col h-full p-10 text-white">

                {/* Logo — top-left of the image */}
                <div className="mb-auto">
                  <img
                    src={darkLogo.src ?? darkLogo}
                    alt="VenueBook"
                    className="h-8 w-auto select-none pointer-events-none"
                    draggable="false"
                  />
                </div>

                {/* Tagline + features — vertically centred */}
                <div className="flex flex-col justify-center flex-1 py-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
                    Venues · Farmstays · Studios · Workspaces · Rentals
                  </p>
                  <h2 className="text-3xl font-bold leading-tight mb-3">
                    Every Space,<br />One Platform.
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed mb-8">
                    Discover and instantly book venues, cozy farmstays, creative studios, productive workspaces, and unique rentals — all in one place.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Event venues & banquet halls",
                      "Farmstays, studios & creative rentals",
                      "Workspaces & meeting rooms",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-sm text-white/90">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 border border-white/30">
                          <CheckIcon />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

            {/* ── Right form panel ─────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

              {/* ── Sticky header: logo (mobile only) · close ── */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-10 pt-5 pb-3 shrink-0 bg-white dark:bg-gray-900">
                {/* Logo — visible on mobile only; desktop shows it in the image panel */}
                <div className="flex items-center md:invisible">
                  <img
                    src={lightLogo.src ?? lightLogo}
                    alt="VenueBook"
                    className="h-8 w-auto dark:hidden select-none pointer-events-none"
                    draggable="false"
                  />
                  <img
                    src={darkLogo.src ?? darkLogo}
                    alt="VenueBook"
                    className="h-8 w-auto hidden dark:block select-none pointer-events-none"
                    draggable="false"
                  />
                </div>

                {/* Close button — always visible */}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <CloseIcon />
                </button>
              </div>

           

              {/* ── Scrollable form content ── */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 sm:px-10 pb-8 pt-1">

                {/* Mode: login | register */}
               {(mode === "login" || mode === "register") && (
                  <>
                    {/* Heading */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {mode === "login" ? "Welcome back" : "Create account"}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mode === "login" ? (
                          <>New to VenueBook?{" "}
                            <button type="button" onClick={() => setMode("register")}
                              className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 transition">
                              Sign up free
                            </button>
                          </>
                        ) : (
                          <>Already have an account?{" "}
                            <button type="button" onClick={() => setMode("login")}
                              className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 transition">
                              Log in
                            </button>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Social buttons */}
                    <div className="space-y-3 mb-5">
                      {/* <SocialButton icon={<GoogleIcon />}   label="Continue with Google" />
                      <SocialButton icon={<FacebookIcon />} label="Continue with Facebook" tint /> */}

                      {/* <SocialButton
  icon={<GoogleIcon />}
  label="Continue with Google"
  onClick={() => handleSocialLogin("google")}
/> */}
<SocialButton
  icon={<GoogleIcon />}
  label={loading ? "Signing in..." : "Continue with Google"}
  onClick={() => googleLogin()}
/>

<SocialButton
  icon={<FacebookIcon />}
  label="Continue with Facebook"
  tint
  onClick={() => handleSocialLogin("facebook")}
/>
                      <SocialButton icon={<PhoneIcon />}    label="Continue with Phone" onClick={() => setMode("phone")} />
                    </div>

                    {/* Divider */}
                    <Divider />

                       {error && (
  <p className="text-red-500 text-sm mb-3">{error}</p>
)}

                    {/* Email / Password form */}
                    <div className="space-y-3 mt-5">
                      {mode === "register" && (
                        <FloatInput id="name" label="Full name" type="text" autoComplete="name"   value={form.name}
    onChange={(e) =>
      setForm({ ...form, name: e.target.value })
    }/>
                      )}
                      <FloatInput id="email" label="Email address" type="email" autoComplete="email"  value={form.email}
  onChange={(e) =>
    setForm({ ...form, email: e.target.value })
  }/>
                      <FloatInput id="password" label="Password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}  
                      value={form.password}
  onChange={(e) =>
    setForm({ ...form, password: e.target.value })
  }/>
                      {mode === "register" && (
                        <FloatInput id="cpassword" label="Confirm password" type="password" autoComplete="new-password"  value={form.cpassword}
    onChange={(e) =>
      setForm({ ...form, cpassword: e.target.value })
    } />
                      )}

                      {mode === "login" && (
                        <div className="text-right">
                          <button type="button" onClick={() => setMode("forgot")}
                            className="text-xs text-violet-600 dark:text-violet-400 hover:underline focus:outline-none">
                            Forgot password?
                          </button>
                        </div>
                      )}

                    <button
  type="button"
  disabled={loading}
  onClick={() => {
    if (mode === "login") handleLogin();
    if (mode === "register") handleRegister();
  }}
  className={[
    "w-full mt-1 bg-violet-600 hover:bg-violet-700 active:bg-violet-800",
    "text-white font-semibold py-3 rounded-xl transition",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
    "flex items-center justify-center gap-2",
    loading ? "opacity-70 cursor-not-allowed" : "",
  ].join(" ")}
>
  {loading ? (
    <>
      <Spinner />
      {mode === "login" ? "Logging in..." : "Creating..."}
    </>
  ) : (
    mode === "login" ? "Log in" : "Create account"
  )}
</button>


                    </div>
                  </>
                )}

                {/* Mode: phone OTP */}
                { mode === "phone" && (
                  <PhoneFlow  onBack={() => setMode("login")}
    phone={phone}
    setPhone={setPhone}
    otp={otp}
    setOtp={setOtp}
    step={step}
    setStep={setStep}
    handleSendOtp={handleSendOtp}
    handleVerifyOtp={handleVerifyOtp}  />
                )}


{/* Mode: Forgot Password */}
{mode === "forgot" && (
  <>
    {/* Back */}
    <button
      onClick={() => {
        setMode("login");
        setFpStep("email");
        setError("");
      }}
      className="mb-6 text-sm"
    >
      ← Back
    </button>

    {error && (
      <p className="text-red-500 text-sm mb-3">{error}</p>
    )}

    {/* STEP 1: EMAIL */}
    {fpStep === "email" && (
      <>
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={fpEmail}
          onChange={(e) => setFpEmail(e.target.value)}
          className={inputBase + " w-full mb-4"}
        />

        <button
          onClick={handleForgotEmail}
          disabled={loading}
          className="w-full bg-violet-600 text-white py-3 rounded-xl"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </>
    )}

    {/* STEP 2: RESET */}
    {fpStep === "sent" && (
      <>
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        <p className="text-sm text-gray-500 mb-4">
          OTP sent to <b>{fpEmail}</b>
        </p>

        {/* OTP */}
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp.join("")}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6).split(""))
          }
          className={inputBase + " w-full mb-3"}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="New password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className={inputBase + " w-full mb-3"}
        />

        {/* CONFIRM */}
        <input
          type="password"
          placeholder="Confirm password"
          value={form.cpassword}
          onChange={(e) =>
            setForm({ ...form, cpassword: e.target.value })
          }
          className={inputBase + " w-full mb-4"}
        />

        <button
          onClick={handleResetPassword}
          disabled={loading}
          className="w-full bg-violet-600 text-white py-3 rounded-xl"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <button
          onClick={handleForgotEmail}
          className="text-sm mt-3 text-gray-500"
        >
          Resend OTP
        </button>
      </>
    )}

    {/* STEP 3: SUCCESS */}
    {fpStep === "success" && (
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">
          Password Updated ✅
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          You can now login with your new password.
        </p>

        <button
          onClick={() => {
            setMode("login");
            setFpStep("email");
          }}
          className="w-full bg-violet-600 text-white py-3 rounded-xl"
        >
          Back to Login
        </button>
      </div>
    )}
  </>
)}
                 

                {/* Terms */}
                <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                  By continuing, you agree to our{" "}
                  <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">Terms of Service</span>
                  {" "}and{" "}
                  <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</span>.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Phone OTP flow                                                      */
/* ─────────────────────────────────────────────────────────────────── */

function PhoneFlow({
  onBack,
  phone,
  setPhone,
  otp,
  setOtp,
  step,
  setStep,
  handleSendOtp,
  handleVerifyOtp,
}) {
  const otpRefs = useRef([]);

  const handleOtpChange = (i, val) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = cleaned;
    setOtp(next);

    if (cleaned && i < 5) {
      otpRefs.current[i + 1]?.focus();
    }
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition focus:outline-none"
      >
        <BackIcon />
        Back
      </button>

      {step === "number" ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Phone sign in
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We'll send a one-time code to verify your number.
            </p>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="shrink-0">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                Code
              </label>
              <div className={inputBase + " w-20 font-medium"}>+91</div>
            </div>

            <div className="flex-1">
              <label
                htmlFor="phone"
                className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium"
              >
                Mobile number
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className={inputBase + " w-full"}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Enter OTP
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Code sent to{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                +91 {phone}
              </span>
              .
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKey(i, e)}
                className={[
                  "h-12 w-full text-center text-lg font-semibold rounded-xl border",
                  "bg-white dark:bg-gray-800",
                  "border-gray-200 dark:border-gray-700",
                  "text-gray-900 dark:text-gray-100",
                  "focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
                  "transition",
                ].join(" ")}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleVerifyOtp}
            className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold py-3 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Verify & Continue
          </button>

          <button
            type="button"
            onClick={() => setStep("number")}
            className="w-full mt-3 text-sm text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition focus:outline-none"
          >
            Didn't receive it? Resend OTP
          </button>
        </>
      )}

     
    </>
  );
}
/* ─────────────────────────────────────────────────────────────────── */
/*  Primitives                                                          */
/* ─────────────────────────────────────────────────────────────────── */

const inputBase = [
  "rounded-xl border border-gray-200 dark:border-gray-700",
  "bg-white dark:bg-gray-800",
  "px-4 py-3 text-sm text-gray-900 dark:text-gray-100",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  "focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
  "transition",
].join(" ");

function FloatInput({ id, label, type, autoComplete , value, onChange  }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
         value={value}
        onChange={onChange}
        className={inputBase + " w-full"}
        placeholder=" "
      />
    </div>
  );
}

function SocialButton({ icon, label, onClick, tint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full flex items-center justify-center gap-3 rounded-xl border py-3 text-sm font-medium",
        "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        tint
          ? "border-[#1877f2]/30 bg-[#1877f2]/5 text-[#1877f2] dark:border-[#1877f2]/20 dark:bg-[#1877f2]/10 hover:bg-[#1877f2]/10 dark:hover:bg-[#1877f2]/15"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or continue with email</span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Inline SVG icons                                                    */
/* ─────────────────────────────────────────────────────────────────── */

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}
