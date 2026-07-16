"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";
import loginBg from "@/assets/loginbackground.png";

import {
  loginApi,
  registerApi,
  sendOtpApi,
  verifyOtpApi,
  socialLoginApi,
  getUserApi,
  forgotPasswordApi,
  resetPasswordApi,
} from "@/services/auth.service";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateOtp,
} from "@/lib/validation";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useRegion } from "@/hooks/useRegion";

/* ─────────────────────────────────────────────────────────────────── */
/*  LoginModal                                                          */
/* ─────────────────────────────────────────────────────────────────── */

// onSuccess — optional callback fired after any successful login/auth.
// When provided, it replaces the default router.push("/") redirect so callers
// can route the user wherever makes sense in their context.
export default function LoginModal({ open, setOpen, onSuccess }) {

  const [mode, setMode] = useState("login"); // login | register | phone
  const t = useTranslations("auth");
  const [user, setUser] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("number"); // number | otp //
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const close = () => setOpen(false);

  const [fpEmail, setFpEmail] = useState("");
  const [fpStep, setFpStep] = useState("email"); // email | sent


  const [showGoogleConfirm, setShowGoogleConfirm] = useState(false);
const [googleUserData, setGoogleUserData] = useState(null);
const [googleAccessToken, setGoogleAccessToken] = useState("");
const [googleProfile, setGoogleProfile] = useState(null);

  const { login, fetchUser } = useAuth();

  /* Strict body scroll lock */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ESC to close */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Reset mode when reopened + save redirect path */
  useEffect(() => {
    if (open) {
      setMode("login");
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem("redirectAfterLogin", currentPath);
    }
  }, [open]);

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
    if (!validatePassword(form.password))
      return setError("Password must be 6+ chars");

    try {
      setLoading(true);

      const res = await loginApi({
        email: form.email,
        password: form.password,
      });

      document.cookie = `token=${res.data.token}; path=/`;
      const freshUser = await fetchUser();
      close();
      // if (onSuccess) onSuccess(); else router.push("/");
      if (onSuccess) {
        onSuccess(freshUser)
      } else {
 const redirectPath =
  sessionStorage.getItem("redirectAfterLogin") || "/";

sessionStorage.removeItem("redirectAfterLogin");

router.push(redirectPath);
      }

     

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
    if (form.password !== form.cpassword)
      return setError("Passwords not match");

    try {
      setLoading(true);

      await registerApi({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setMode("login");
    } catch (err) {
      console.log(err);
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

      document.cookie = `token=${res.data.token}; path=/`;
      const freshUser = await fetchUser();
      close();
      // if (onSuccess) onSuccess(); else router.push("/");
        if (onSuccess) {
        onSuccess(freshUser)
      } else {
 const redirectPath =
  sessionStorage.getItem("redirectAfterLogin") || "/";

sessionStorage.removeItem("redirectAfterLogin");

router.push(redirectPath);
      }
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

      document.cookie = `token=${res.data.token}; path=/`;
      const freshUser = await fetchUser();
      close();
      // if (onSuccess) onSuccess(); else router.push("/");
        if (onSuccess) {
        onSuccess(freshUser)
      } else {
 const redirectPath =
  sessionStorage.getItem("redirectAfterLogin") || "/";

sessionStorage.removeItem("redirectAfterLogin");

router.push(redirectPath);
      }
    } catch (err) {
      setError("Social login failed");
    } finally {
      setLoading(false);
    }
  };

  //gOOGLE LOGIN
  // const googleLogin = useGoogleLogin({
  //   scope: "openid email profile", // ✅ ADD THIS

  //   onSuccess: async (tokenResponse) => {
  //     try {
  //       setLoading(true);

  //       console.log("TOKEN RESPONSE:", tokenResponse);

  //       const accessToken = tokenResponse.access_token;

  //       if (!accessToken) {
  //         throw new Error("No access token received");
  //       }

  //       const res = await socialLoginApi("google", accessToken);

  //       document.cookie = `token=${res.data.token}; path=/`;
  //       await fetchUser();
  //       close();
  //       if (onSuccess) onSuccess(); else router.push("/");
  //     } catch (err) {
  //       console.error(err);
  //       setError("Google login failed");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },

  //   onError: () => {
  //     setError("Google login cancelled");
  //   },
  // });

 const googleLogin = useGoogleLogin({
  scope: "openid email profile",

  onSuccess: async (tokenResponse) => {
    try {
      setLoading(true);

      const accessToken = tokenResponse.access_token;

      // GET GOOGLE PROFILE
      const googleRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const profile = await googleRes.json();

      // SAVE TEMP DATA
      setGoogleAccessToken(accessToken);
      setGoogleProfile(profile);

      // OPEN CONFIRM MODAL
      setShowGoogleConfirm(true);

    } catch (err) {
      console.error(err);
      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  },

  onError: () => {
    setError("Google login cancelled");
  },
});

const handleGoogleContinue = async () => {
  try {
    setLoading(true);

    const res = await socialLoginApi(
      "google",
      googleAccessToken
    );

    document.cookie = `token=${res.data.token}; path=/`;

    const freshUser = await fetchUser();

    setShowGoogleConfirm(false);

    close();

    // if (onSuccess) onSuccess();
    // else router.push("/");
      if (onSuccess) {
        onSuccess(freshUser)
      } else {
 const redirectPath =
  sessionStorage.getItem("redirectAfterLogin") || "/";

sessionStorage.removeItem("redirectAfterLogin");

router.push(redirectPath);
      }

  } catch (err) {
    setError("Google registration failed");
  } finally {
    setLoading(false);
  }
};

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
      console.log(err);
      setError(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const avatar =
  googleProfile?.picture ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    googleProfile?.name || "User"
  )}`;

  /* Avatar with first-letter fallback — shown while image loads or on error */

  return (
    <AnimatePresence>
      {open && (
        <Fragment key="login-root">
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
            aria-label={mode === "register" ? t("createAccount") : t("login")}
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
                    alt="venuebook.in"
                    className="h-8 w-auto select-none pointer-events-none"
                    draggable="false"
                  />
                </div>

                {/* Tagline + features — vertically centred */}
                <div className="flex flex-col justify-center flex-1 py-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
                    {t("venuesFarmstays")}
                  </p>
                  <h2 className="text-3xl font-bold leading-snug mb-3">
                    {t("everySpace")}
                    <br />
                    {t("onePlatform")}
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed mb-8">
                    {t("discoverText")}
                  </p>
                  <ul className="space-y-3">
                    {[
                      t("featureVenues"),
                      t("featureFarmstays"),
                      t("featureWorkspaces"),
                    ].map((t) => (
                      <li
                        key={t}
                        className="flex items-center gap-3 text-sm text-white/90"
                      >
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
                    alt="venuebook.in"
                    className="h-8 w-auto dark:hidden select-none pointer-events-none"
                    draggable="false"
                  />
                  <img
                    src={darkLogo.src ?? darkLogo}
                    alt="venuebook.in"
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
                        {mode === "login"
                          ? t("welcomeBack")
                          : t("createAccount")}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mode === "login" ? (
                          <>
                            {t("newToVenueBook")}{" "}
                            <button
                              type="button"
                              onClick={() => setMode("register")}
                              className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 transition"
                            >
                              {t("signUpFree")}
                            </button>
                          </>
                        ) : (
                          <>
                            {t("alreadyHaveAccount")}{" "}
                            <button
                              type="button"
                              onClick={() => setMode("login")}
                              className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 transition"
                            >
                              {t("login")}
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
                        label={
                          loading ? "Signing in..." : t("continueWithGoogle")
                        }
                        onClick={() => googleLogin()}
                      />
{/* 
                      <SocialButton
                        icon={<FacebookIcon />}
                        label={t("continueWithFacebook")}
                        tint
                        onClick={() => handleSocialLogin("facebook")}
                      /> */}
                      <SocialButton
                        icon={<PhoneIcon />}
                        label={t("continueWithPhone")}
                        onClick={() => setMode("phone")}
                      />
                    </div>

                    {/* Divider */}
                    <Divider t={t} />

                    {/* Email / Password form */}
                    <div className="space-y-3 mt-5">
                      {mode === "register" && (
                        <FloatInput
                          id="name"
                          label={t("fullName")}
                          type="text"
                          autoComplete="name"
                          placeholder="Enter your full name"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                        />
                      )}
                      <FloatInput
                        id="email"
                        label={t("emailAddress")}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                      <FloatInput
                        id="password"
                        label={t("password")}
                        type="password"
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                        placeholder={mode === "login" ? "Enter your password" : "Create a password"}
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                      />
                      {mode === "register" && (
                        <FloatInput
                          id="cpassword"
                          label={t("confirmPassword")}
                          type="password"
                          autoComplete="new-password"
                          placeholder="Repeat your password"
                          value={form.cpassword}
                          onChange={(e) =>
                            setForm({ ...form, cpassword: e.target.value })
                          }
                        />
                      )}

                      {mode === "login" && (
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => setMode("forgot")}
                            className="text-xs text-violet-600 dark:text-violet-400 hover:underline focus:outline-none"
                          >
                            {t("forgotPassword")}
                          </button>
                        </div>
                      )}

                      {/* Error slot — directly above submit, reserved to prevent layout shift */}
                      <div className="min-h-[20px]" role="alert" aria-live="polite">
                        {error && (
                          <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                            <ErrorIcon />
                            {error}
                          </p>
                        )}
                      </div>

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
                            {mode === "login" ? t("loggingIn") : t("creating")}
                          </>
                        ) : mode === "login" ? (
                          t("login")
                        ) : (
                          t("createAccount")
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* Mode: phone OTP */}
                {mode === "phone" && (
                  <PhoneFlow
                    t={t}
                    onBack={() => setMode("login")}
                    setPhone={setPhone}
                    otp={otp}
                    setOtp={setOtp}
                    step={step}
                    setStep={setStep}
                    handleSendOtp={handleSendOtp}
                    handleVerifyOtp={handleVerifyOtp}
                    error={error}
                  />
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
                      className="mb-6 text-sm flex items-center gap-2"
                    >
                       <BackIcon />
                      {t("back")}
                    </button>

                    {/* STEP 1: EMAIL */}
                    {fpStep === "email" && (
                      <>
                        <h2 className="text-xl font-bold mb-4">
                          {t("forgotPasswordTitle")}
                        </h2>

                        <input
                          type="email"
                          placeholder={t("enterYourEmail")}
                          value={fpEmail}
                          onChange={(e) => setFpEmail(e.target.value)}
                          className={inputBase + " w-full"}
                        />

                        {/* Error slot */}
                        <div className="min-h-[20px] mt-1 mb-3" role="alert" aria-live="polite">
                          {error && (
                            <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                              <ErrorIcon />
                              {error}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={handleForgotEmail}
                          disabled={loading}
                          className="w-full bg-violet-600 text-white py-3 rounded-xl"
                        >
                          {loading ? t("sending") : t("sendOtp")}
                        </button>
                      </>
                    )}

                    {/* STEP 2: RESET */}
                    {fpStep === "sent" && (
                      <>
                        <h2 className="text-xl font-bold mb-4">
                          {t("resetPassword")}
                        </h2>

                        <p className="text-sm text-gray-500 mb-4">
                          {t("otpSentTo")} <b>{fpEmail}</b>
                        </p>

                        {/* OTP */}
                        <input
                          type="text"
                          placeholder={t("enterOtpPlaceholder")}
                          value={otp.join("")}
                          onChange={(e) =>
                            setOtp(
                              e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6)
                                .split(""),
                            )
                          }
                          className={inputBase + " w-full mb-3"}
                        />

                        {/* PASSWORD */}
                        <div className="mb-3">
                          <FloatInput
                            id="fp-password"
                            type="password"
                            placeholder={t("newPassword")}
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                          />
                        </div>

                        {/* CONFIRM */}
                        <FloatInput
                          id="fp-cpassword"
                          type="password"
                          placeholder={t("confirmPassword")}
                          autoComplete="new-password"
                          value={form.cpassword}
                          onChange={(e) => setForm({ ...form, cpassword: e.target.value })}
                        />

                        {/* Error slot */}
                        <div className="min-h-[20px] mt-1 mb-3" role="alert" aria-live="polite">
                          {error && (
                            <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                              <ErrorIcon />
                              {error}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={handleResetPassword}
                          disabled={loading}
                          className="w-full bg-violet-600 text-white py-3 rounded-xl"
                        >
                          {loading ? t("updating") : t("updatePassword")}
                        </button>

                        <button
                          onClick={handleForgotEmail}
                          className="text-sm mt-3 text-gray-500"
                        >
                          {t("resendOtp")}
                        </button>
                      </>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {fpStep === "success" && (
                      <div className="text-center">
                        <h2 className="text-xl font-bold mb-2">
                          {t("passwordUpdated")}
                        </h2>

                        <p className="text-sm text-gray-500 mb-4">
                          {t("passwordUpdatedSubtitle")}
                        </p>

                        <button
                          onClick={() => {
                            setMode("login");
                            setFpStep("email");
                          }}
                          className="w-full bg-violet-600 text-white py-3 rounded-xl"
                        >
                          {t("backToLogin")}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Terms */}
                <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                  {t("termsText")}{" "}
                  <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
                   {t("termsOfService")}
                  </span>{" "}
                  {t("and")}{" "}
                  <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
                    {t("privacyPolicy")}
                  </span>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        </Fragment>
      )}
      {showGoogleConfirm && (
  <div key="google-confirm" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    
    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl">

      <div className="text-center">

     <GoogleAvatar
  src={googleProfile?.picture}
  name={googleProfile?.name}
/>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Continue with Google
        </h2>

        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Continue as
        </p>

        <div className="mt-4 rounded-2xl bg-gray-50 dark:bg-gray-800 p-4">
          <p className="font-semibold text-gray-900 dark:text-white">
            {googleProfile?.name}
          </p>

          <p className="text-sm text-gray-500">
            {googleProfile?.email}
          </p>
        </div>

        <div className="mt-6 flex gap-3">

          <button
            onClick={() => setShowGoogleConfirm(false)}
            className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleGoogleContinue}
            className="flex-1 rounded-2xl bg-violet-600 hover:bg-violet-700 px-4 py-3 text-sm font-medium text-white"
          >
            Continue
          </button>

        </div>
      </div>
    </div>
  </div>
)}
    </AnimatePresence>

    
  );
  
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Phone countries — extend this list to support more regions          */
/* ─────────────────────────────────────────────────────────────────── */

const PHONE_COUNTRIES = [
  { code: "IN", name: "India", dialCode: "+91",  flag: "/flags/in.svg", maxDigits: 10 },
  { code: "AE", name: "UAE",   dialCode: "+971", flag: "/flags/ae.svg", maxDigits: 9  },
];

/* ─────────────────────────────────────────────────────────────────── */
/*  Google confirm — profile avatar with first-letter fallback          */
/*  Shows initial while image loads; falls back permanently on error    */
/* ─────────────────────────────────────────────────────────────────── */
function GoogleAvatar({ src, name }) {
  const [imgState, setImgState] = useState("loading"); // "loading" | "loaded" | "error"

  const initial = (name || "U").trim()[0].toUpperCase();

  /* Gradient palette keyed by first letter so it stays consistent */
  const GRADIENTS = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-500",
    "from-cyan-500 to-sky-600",
  ];
  const gradient = GRADIENTS[initial.charCodeAt(0) % GRADIENTS.length];

  const showFallback = imgState !== "loaded";

  return (
    <div className="relative w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-lg overflow-hidden">
      {/* Lettered fallback — visible while loading or on error */}
      {showFallback && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient}`}
          aria-hidden="true"
        >
          <span className="text-2xl font-bold text-white select-none">
            {initial}
          </span>
        </div>
      )}

      {/* Actual Google profile image — hidden until fully loaded */}
      {src && (
        <img
          src={src}
          alt={name || "Profile"}
          onLoad={() => setImgState("loaded")}
          onError={() => setImgState("error")}
          className={[
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            imgState === "loaded" ? "opacity-100" : "opacity-0",
          ].join(" ")}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Phone OTP flow                                                      */
/* ─────────────────────────────────────────────────────────────────── */

function PhoneFlow({
  t,
  onBack,
  setPhone,
  otp,
  setOtp,
  step,
  setStep,
  handleSendOtp,
  handleVerifyOtp,
  error,
}) {
  const otpRefs = useRef([]);
  const { regionConfig } = useRegion();

  /* Default country driven by active region: IN → +91, AE → +971 */
  const [selectedCountry, setSelectedCountry] = useState(
    () => PHONE_COUNTRIES.find((c) => c.code === regionConfig?.code) ?? PHONE_COUNTRIES[0]
  );
  const [localDigits, setLocalDigits] = useState("");

  const handleDigitChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, selectedCountry.maxDigits);
    setLocalDigits(digits);
    setPhone(selectedCountry.dialCode + digits);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setPhone(country.dialCode + localDigits);
  };

  const handleOtpChange = (i, val) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = cleaned;
    setOtp(next);
    if (cleaned && i < 5) otpRefs.current[i + 1]?.focus();
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
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition focus:outline-none"
      >
        <BackIcon />
        {t("back")}
      </button>

      {step === "number" ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {t("phoneSignIn")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("phoneSubtitle")}
            </p>
          </div>

          {/* Unified phone input — country selector + number in one border */}
          <div className="mb-2">
            <label
              htmlFor="phone"
              className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5"
            >
              {t("mobileNumber")}
            </label>
            <div className="flex items-stretch rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800
                            transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
              <CountryCodeSelect
                selected={selectedCountry}
                countries={PHONE_COUNTRIES}
                onChange={handleCountryChange}
              />
              {/* Visual divider */}
              <div className="w-px bg-gray-200 dark:bg-gray-700 shrink-0 self-stretch" />
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={localDigits}
                onChange={handleDigitChange}
                className="flex-1 min-w-0 px-4 py-3 text-sm bg-transparent rounded-e-xl
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:outline-none"
              />
            </div>
          </div>

          {/* Error slot — below phone input */}
          <div className="min-h-[20px] mt-1" role="alert" aria-live="polite">
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                <ErrorIcon />
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full mt-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800
                       disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            {t("sendOtp")}
          </button>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {t("enterOtp")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("codeSentTo")}{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {selectedCountry.dialCode} {localDigits}
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

          {/* Error slot — below OTP inputs */}
          <div className="min-h-[20px] mb-3" role="alert" aria-live="polite">
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                <ErrorIcon />
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleVerifyOtp}
            className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white
                       font-semibold py-3 rounded-xl transition focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            {t("verifyContinue")}
          </button>

          <button
            type="button"
            onClick={() => setStep("number")}
            className="w-full mt-3 text-sm text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition focus:outline-none"
          >
            {t("resendOtp")}
          </button>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  CountryCodeSelect                                                   */
/* ─────────────────────────────────────────────────────────────────── */

function CountryCodeSelect({ selected, countries, onChange }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const containerRef        = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-full px-3.5 py-3 text-sm font-medium
                   text-gray-700 dark:text-gray-300 rounded-s-xl
                   hover:bg-gray-50 dark:hover:bg-gray-700/50
                   transition focus:outline-none whitespace-nowrap"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Image
          src={selected.flag}
          alt={selected.code}
          width={24}
          height={17}
          className="rounded-sm object-contain shrink-0"
        />
        <span>{selected.dialCode}</span>
        <ChevronDownSmIcon open={open} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-1 start-0 z-50 w-56
                       rounded-xl border border-gray-100 dark:border-gray-700
                       bg-white dark:bg-gray-800
                       shadow-lg shadow-black/10 dark:shadow-black/40 overflow-hidden"
            role="listbox"
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <input
                autoFocus
                type="text"
                placeholder="Search country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg
                           bg-gray-50 dark:bg-gray-700
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           border border-gray-200 dark:border-gray-600
                           focus:outline-none focus:border-violet-400"
              />
            </div>

            {/* Country list */}
            <ul className="max-h-44 overflow-y-auto py-1">
              {filtered.map((country) => (
                <li key={country.code} role="option" aria-selected={selected.code === country.code}>
                  <button
                    type="button"
                    onClick={() => { onChange(country); setOpen(false); setSearch(""); }}
                    className={[
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-start transition",
                      "hover:bg-gray-50 dark:hover:bg-gray-700/60",
                      selected.code === country.code
                        ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"
                        : "text-gray-700 dark:text-gray-300",
                    ].join(" ")}
                  >
                    <Image
                      src={country.flag}
                      alt={country.code}
                      width={24}
                      height={17}
                      className="rounded-sm object-contain shrink-0"
                    />
                    <span className="flex-1 truncate">{country.name}</span>
                    <span className="text-gray-400 dark:text-gray-500 font-medium tabular-nums">
                      {country.dialCode}
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                  No results
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

function FloatInput({ id, label, type, autoComplete, value, onChange, placeholder }) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPwd ? "text" : "password") : type;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={inputBase + " w-full" + (isPassword ? " pe-11" : "")}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPwd ? "Hide password" : "Show password"}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
          >
            {showPwd ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
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

function Divider({ t }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
        {t("orContinueWithEmail")}
      </span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Inline SVG icons                                                    */
/* ─────────────────────────────────────────────────────────────────── */

function ErrorIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ChevronDownSmIcon({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="#1877f2"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
