import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import "./login.css";

export default function Login() {

  const { login, loginWithData, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    mobile: "",
    email: "",
    username: "",
    password: "",
  });

  const [showSignup, setShowSignup] = useState(false);
  const [signupOtp, setSignupOtp] = useState("");
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupEmailVerified, setSignupEmailVerified] = useState(false);
  const [isSignupOtpBusy, setIsSignupOtpBusy] = useState(false);
  const [isSignupVerifyBusy, setIsSignupVerifyBusy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotType, setForgotType] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotResetToken, setForgotResetToken] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [isResetReady, setIsResetReady] = useState(false);
  const [isForgotBusy, setIsForgotBusy] = useState(false);
  const [forgotResult, setForgotResult] = useState("");

  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailLoginEmail, setEmailLoginEmail] = useState("");
  const [emailLoginOtp, setEmailLoginOtp] = useState("");
  const [emailLoginOtpSent, setEmailLoginOtpSent] = useState(false);
  const [isEmailLoginBusy, setIsEmailLoginBusy] = useState(false);
  const [emailLoginResult, setEmailLoginResult] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [message, setMessage] = useState("");
  const [signupTouched, setSignupTouched] = useState({
    name: false,
    mobile: false,
    email: false,
    username: false,
    password: false,
  });

  const isNameValid = (name) => /^[A-Za-z ]{2,}$/.test(name.trim());
  const isMobileValid = (mobile) => /^\d{10}$/.test(mobile);
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.trim());
  const isUsernameValid = (username) => /^[A-Za-z0-9_]{4,15}$/.test(username.trim());
  const isPasswordValid = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10}$/.test(password);

  const getPasswordChecks = (password) => ({
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    exactTen: password.length === 10,
  });

  const getSignupFieldClass = (fieldName) => {
    if (!signupTouched[fieldName]) {
      return "";
    }

    const value = signupData[fieldName];

    if (fieldName === "name") {
      return isNameValid(value) ? "is-valid-custom" : "is-invalid-custom";
    }

    if (fieldName === "mobile") {
      return isMobileValid(value) ? "is-valid-custom" : "is-invalid-custom";
    }

    if (fieldName === "email") {
      return isEmailValid(value) ? "is-valid-custom" : "is-invalid-custom";
    }

    if (fieldName === "username") {
      return isUsernameValid(value) ? "is-valid-custom" : "is-invalid-custom";
    }

    return isPasswordValid(value) ? "is-valid-custom" : "is-invalid-custom";
  };

  const markSignupTouched = (fieldName) => {
    setSignupTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const resetForgotState = () => {
    setForgotResult("");
    setForgotEmail("");
    setForgotOtp("");
    setForgotResetToken("");
    setForgotNewPassword("");
    setIsOtpRequested(false);
    setIsResetReady(false);
  };


  const resetSignupOtpState = () => {
    setSignupOtp("");
    setSignupOtpSent(false);
    setSignupEmailVerified(false);
    setIsSignupOtpBusy(false);
    setIsSignupVerifyBusy(false);
  };

  const handleSendSignupOtp = async () => {
    if (!isEmailValid(signupData.email)) {
      setMessage("Enter a valid email first");
      return;
    }
    setIsSignupOtpBusy(true);
    setMessage("");
    try {
      const result = await api.post("/auth/signup/send-otp", { email: signupData.email });
      setSignupOtpSent(true);
      setSignupEmailVerified(false);
      setSignupOtp("");
      setMessage(result.message || "OTP sent to your email");
    } catch (error) {
      setMessage(error.message || "Unable to send OTP");
    } finally {
      setIsSignupOtpBusy(false);
    }
  };

  const handleVerifySignupOtp = async () => {
    if (!signupOtp.trim() || signupOtp.length < 6) {
      setMessage("Enter the 6-digit OTP sent to your email");
      return;
    }
    setIsSignupVerifyBusy(true);
    setMessage("");
    try {
      const result = await api.post("/auth/signup/verify-otp", {
        email: signupData.email,
        otp: signupOtp,
      });
      setSignupEmailVerified(true);
      setMessage(result.message || "Email verified");
    } catch (error) {
      setMessage(error.message || "OTP verification failed");
    } finally {
      setIsSignupVerifyBusy(false);
    }
  };

  const resetEmailLoginState = () => {
    setEmailLoginEmail("");
    setEmailLoginOtp("");
    setEmailLoginOtpSent(false);
    setEmailLoginResult("");
  };

  const handleSendEmailLoginOtp = async () => {
    if (!isEmailValid(emailLoginEmail)) {
      setEmailLoginResult("Enter a valid email address");
      return;
    }
    setIsEmailLoginBusy(true);
    setEmailLoginResult("");
    try {
      const result = await api.post("/auth/email-login/send-otp", { email: emailLoginEmail });
      setEmailLoginOtpSent(true);
      setEmailLoginOtp("");
      setEmailLoginResult(result.message || "OTP sent to your email");
    } catch (error) {
      setEmailLoginResult(error.message || "Unable to send OTP");
    } finally {
      setIsEmailLoginBusy(false);
    }
  };

  const handleVerifyEmailLoginOtp = async () => {
    if (!emailLoginOtp.trim() || emailLoginOtp.length < 6) {
      setEmailLoginResult("Enter the 6-digit OTP sent to your email");
      return;
    }
    setIsEmailLoginBusy(true);
    setEmailLoginResult("");
    try {
      const response = await api.post("/auth/email-login/verify-otp", {
        email: emailLoginEmail,
        otp: emailLoginOtp,
      });
      const result = loginWithData(response);
      navigate(result.homePath || (result.role === "user" ? "/user" : "/admin"), { replace: true });
    } catch (error) {
      setEmailLoginResult(error.message || "OTP verification failed");
    } finally {
      setIsEmailLoginBusy(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await login(loginData.username, loginData.password);

    if (!result.success) {
      alert("Invalid username or password!");
      return;
    }

    navigate(result.homePath || (result.role === "user" ? "/user" : "/admin"), { replace: true });
  };


  const handleSignup = async (e) => {
    e.preventDefault();

    setSignupTouched({
      name: true,
      mobile: true,
      email: true,
      username: true,
      password: true,
    });

    if (!isNameValid(signupData.name)) {
      setMessage("Name is required (only letters, min 2 characters)");
      return;
    }

    if (!isMobileValid(signupData.mobile)) {
      setMessage("Phone number must be exactly 10 digits");
      return;
    }

    if (!isEmailValid(signupData.email)) {
      setMessage("Enter a valid email like example@gmail.com or .in");
      return;
    }

    if (!isUsernameValid(signupData.username)) {
      setMessage("Username must be 4-15 characters (letters, numbers, underscore)");
      return;
    }

    if (!isPasswordValid(signupData.password)) {
      setMessage("Password must contain 1 uppercase, 1 lowercase, 1 number, 1 special character and be exactly 10 characters. Example: #Babu12345");
      return;
    }

    if (!signupEmailVerified) {
      setMessage("Please verify your email first.");
      return;
    }

    const result = await signup({ ...signupData, otp: signupOtp });

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    setMessage("Registered successfully!");
    setSignupData({
      name: "",
      mobile: "",
      email: "",
      username: "",
      password: "",
    });
    setSignupTouched({
      name: false,
      mobile: false,
      email: false,
      username: false,
      password: false,
    });
    resetSignupOtpState();
  };


  const handleForgotGet = async () => {
    if (!forgotEmail.trim()) {
      setForgotResult("Please enter email");
      return;
    }

    setIsForgotBusy(true);
    try {
      const result = await api.post("/auth/forgot/request-otp", {
        email: forgotEmail,
        type: forgotType,
      });

      setIsOtpRequested(true);
      setIsResetReady(false);
      setForgotResetToken("");
      setForgotNewPassword("");
      setForgotResult(result.message || "OTP sent to your email");
    } catch (error) {
      setForgotResult(error.message || "Unable to send OTP");
    } finally {
      setIsForgotBusy(false);
    }
  };

  const handleForgotVerifyOtp = async () => {
    if (!forgotOtp.trim()) {
      setForgotResult("Please enter OTP");
      return;
    }

    setIsForgotBusy(true);
    try {
      const result = await api.post("/auth/forgot/verify-otp", {
        email: forgotEmail,
        type: forgotType,
        otp: forgotOtp,
      });
      setForgotResult(result.message || "Verification successful");
      if (forgotType === "password" && result.resetToken) {
        setForgotResetToken(result.resetToken);
        setForgotNewPassword("");
        setIsResetReady(true);
      } else {
        setForgotOtp("");
        setIsOtpRequested(false);
      }
    } catch (error) {
      setForgotResult(error.message || "OTP verification failed");
    } finally {
      setIsForgotBusy(false);
    }
  };

  const handleForgotResetPassword = async () => {
    if (!isPasswordValid(forgotNewPassword)) {
      setForgotResult("Password must contain 1 uppercase, 1 lowercase, 1 number, 1 special character and be exactly 10 characters. Example: #Babu12345");
      return;
    }

    setIsForgotBusy(true);
    try {
      const result = await api.post("/auth/forgot/reset-password", {
        resetToken: forgotResetToken,
        newPassword: forgotNewPassword,
      });
      setForgotResult(result.message || "Password reset successful");
      setForgotOtp("");
      setForgotResetToken("");
      setForgotNewPassword("");
      setIsOtpRequested(false);
      setIsResetReady(false);
    } catch (error) {
      setForgotResult(error.message || "Unable to reset password");
    } finally {
      setIsForgotBusy(false);
    }
  };

  const passwordChecks = getPasswordChecks(signupData.password);

  return (
    <div className="login-container">
      <button
        type="button"
        className="login-home-btn"
        onClick={() => navigate("/")}
        aria-label="Go to home"
        title="Home"
      >
        <i className="fa-solid fa-house"></i>
      </button>

     
      <div className="login-left d-flex flex-column justify-content-center">

        {!showForgot && !showEmailLogin ? (
          <>
            <div className="form-title">Sign In</div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <div className="icon-input-wrap">
                  <i className="fa-solid fa-user input-icon"></i>
                  <input
                    type="text"
                    className="form-control"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="icon-input-wrap">
                  <i className="fa-solid fa-lock input-icon"></i>
                  <input
                    type="password"
                    className="form-control"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Sign In
              </button>

              <div className="d-flex justify-content-between mt-3">
                <span
                  className="link"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotType("username");
                    resetForgotState();
                  }}
                >
                  Forgot Username?
                </span>

                <span
                  className="link"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotType("password");
                    resetForgotState();
                  }}
                >
                  Forgot Password?
                </span>
              </div>
            </form>

            <div className="email-login-divider"><span>or</span></div>
            <div className="text-center">
              <span
                className="link"
                onClick={() => {
                  setShowEmailLogin(true);
                  resetEmailLoginState();
                }}
              >
                Sign in with Email
              </span>
            </div>
          </>
        ) : showEmailLogin ? (
          <>
            <div className="form-title">Sign in with Email</div>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Enter your Email"
              value={emailLoginEmail}
              readOnly={emailLoginOtpSent}
              onChange={(e) => {
                setEmailLoginEmail(e.target.value);
                setEmailLoginResult("");
                setEmailLoginOtpSent(false);
                setEmailLoginOtp("");
              }}
            />

            {emailLoginOtpSent && (
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter 6-digit OTP"
                value={emailLoginOtp}
                onChange={(e) => {
                  setEmailLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setEmailLoginResult("");
                }}
                maxLength={6}
              />
            )}

            {!emailLoginOtpSent ? (
              <button
                className="btn btn-primary w-100"
                onClick={handleSendEmailLoginOtp}
                disabled={isEmailLoginBusy}
              >
                {isEmailLoginBusy ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <button
                className="btn btn-primary w-100"
                onClick={handleVerifyEmailLoginOtp}
                disabled={isEmailLoginBusy || emailLoginOtp.length < 6}
              >
                {isEmailLoginBusy ? "Verifying..." : "Verify OTP & Login"}
              </button>
            )}

            {emailLoginOtpSent && (
              <div className="text-center mt-2">
                <span
                  className="link"
                  style={{ fontSize: "0.82rem" }}
                  onClick={isEmailLoginBusy ? undefined : handleSendEmailLoginOtp}
                >
                  {isEmailLoginBusy ? "Sending..." : "Resend OTP"}
                </span>
              </div>
            )}

            <div className="forgot-result">{emailLoginResult}</div>

            <div
              className="link mt-2"
              onClick={() => {
                setShowEmailLogin(false);
                resetEmailLoginState();
              }}
            >
              Back to Login
            </div>
          </>
        ) : (
          <>
            <div className="form-title">
              {forgotType === "username"
                ? "Forgot Username"
                : "Forgot Password"}
            </div>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Enter Email"
              value={forgotEmail}
              onChange={(e) => {
                setForgotEmail(e.target.value);
                setForgotResult("");
              }}
            />

            {isOtpRequested ? (
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter OTP"
                value={forgotOtp}
                onChange={(e) => {
                  setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setForgotResult("");
                }}
                maxLength={6}
              />
            ) : null}

            {isResetReady ? (
              <input
                type="password"
                className="form-control mb-3"
                placeholder="Enter New Password"
                value={forgotNewPassword}
                onChange={(e) => {
                  setForgotNewPassword(e.target.value.slice(0, 10));
                  setForgotResult("");
                }}
                maxLength={10}
              />
            ) : null}

            {!isOtpRequested ? (
              <button className="btn btn-primary w-100" onClick={handleForgotGet} disabled={isForgotBusy}>
                {isForgotBusy ? "Sending..." : "Get OTP"}
              </button>
            ) : isResetReady ? (
              <button className="btn btn-primary w-100" onClick={handleForgotResetPassword} disabled={isForgotBusy}>
                {isForgotBusy ? "Resetting..." : "Reset Password"}
              </button>
            ) : (
              <button className="btn btn-primary w-100" onClick={handleForgotVerifyOtp} disabled={isForgotBusy}>
                {isForgotBusy ? "Verifying..." : "Verify OTP"}
              </button>
            )}

            <div className="forgot-result">{forgotResult}</div>

            <div
              className="link mt-2"
              onClick={() => {
                setShowForgot(false);
                resetForgotState();
              }}
            >
              Back to Login
            </div>
          </>
        )}
      </div>

      
      <div className="login-right d-flex flex-column align-items-center justify-content-center">

        {!showSignup ? (
          <button
            type="button"
            className="btn-gradient-signup mt-4"
            onClick={() => setShowSignup(true)}
          >
            Sign Up
          </button>
        ) : (
          <div className="signup-panel">
            <div className="signup-scroll-area" tabIndex={0}>
              <div className="form-title">New Register</div>

              <form onSubmit={handleSignup}>
                <label className="form-label">Name</label>
                <input
                  className={`form-control mb-2 ${getSignupFieldClass("name")}`}
                  placeholder="Name"
                  value={signupData.name}
                  onChange={(e) => {
                    setSignupData({ ...signupData, name: e.target.value });
                    markSignupTouched("name");
                    setMessage("");
                  }}
                  onBlur={() => {
                    setMessage("");
                    markSignupTouched("name");
                  }}
                />

                <label className="form-label">Phone Number</label>
                <div className={`mobile-input-wrap mb-2 ${getSignupFieldClass("mobile")}`}>
                  <span className="mobile-prefix">+91</span>
                  <input
                    className="form-control mobile-input"
                    placeholder="Phone Number"
                    value={signupData.mobile}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setSignupData({ ...signupData, mobile: onlyDigits });
                      markSignupTouched("mobile");
                      setMessage("");
                    }}
                    onBlur={() => {
                      setMessage("");
                      markSignupTouched("mobile");
                    }}
                    maxLength={10}
                  />
                </div>

                <label className="form-label">Email</label>
                <div className="position-relative mb-2">
                  <input
                    className={`form-control ${signupEmailVerified ? "is-valid-custom" : getSignupFieldClass("email")}`}
                    placeholder="Email"
                    value={signupData.email}
                    readOnly={signupEmailVerified}
                    onChange={(e) => {
                      setSignupData({ ...signupData, email: e.target.value });
                      markSignupTouched("email");
                      setMessage("");
                      resetSignupOtpState();
                    }}
                    onBlur={() => {
                      setMessage("");
                      markSignupTouched("email");
                    }}
                  />
                  {signupEmailVerified && (
                    <span className="email-verified-badge">✓ Email Verified</span>
                  )}
                </div>

                {!signupEmailVerified && (
                  <>
                    {!signupOtpSent ? (
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm w-100 mb-2"
                        onClick={handleSendSignupOtp}
                        disabled={isSignupOtpBusy || !isEmailValid(signupData.email)}
                      >
                        {isSignupOtpBusy ? "Sending OTP..." : "Send OTP to Email"}
                      </button>
                    ) : (
                      <div className="mb-2">
                        <label className="form-label">Email OTP</label>
                        <input
                          className="form-control mb-2"
                          placeholder="Enter 6-digit OTP"
                          value={signupOtp}
                          onChange={(e) => {
                            setSignupOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                            setMessage("");
                          }}
                          maxLength={6}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm w-100 mb-1"
                          onClick={handleVerifySignupOtp}
                          disabled={isSignupVerifyBusy || signupOtp.length < 6}
                        >
                          {isSignupVerifyBusy ? "Verifying..." : "Verify OTP"}
                        </button>
                        <div className="text-center">
                          <span
                            className="link"
                            style={{ fontSize: "0.82rem" }}
                            onClick={isSignupOtpBusy ? undefined : handleSendSignupOtp}
                          >
                            {isSignupOtpBusy ? "Sending..." : "Resend OTP"}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {signupEmailVerified && (
                  <>
                    <label className="form-label">Username</label>
                    <input
                      className={`form-control mb-2 ${getSignupFieldClass("username")}`}
                      placeholder="Username"
                      value={signupData.username}
                      onChange={(e) => {
                        setSignupData({ ...signupData, username: e.target.value });
                        markSignupTouched("username");
                        setMessage("");
                      }}
                      onBlur={() => {
                        setMessage("");
                        markSignupTouched("username");
                      }}
                    />

                    <label className="form-label">Password</label>
                    <div className="password-input-wrap mb-2">
                      <input
                        type="password"
                        className={`form-control ${getSignupFieldClass("password")}`}
                        placeholder="Password"
                        value={signupData.password}
                        onChange={(e) => {
                          setSignupData({
                            ...signupData,
                            password: e.target.value.slice(0, 10),
                          });
                          markSignupTouched("password");
                          setMessage("");
                        }}
                        onBlur={() => {
                          setMessage("");
                          markSignupTouched("password");
                        }}
                        maxLength={10}
                      />
                      <button
                        type="button"
                        className="password-rule-toggle"
                        onClick={() => setShowPasswordRules((prev) => !prev)}
                        title="Password rules"
                        aria-label="Toggle password rules"
                      >
                        <i className="fa-solid fa-circle-info"></i>
                      </button>
                    </div>

                    {showPasswordRules && (
                      <div className="password-rules mb-2">
                        <div className={passwordChecks.hasUpper ? "rule ok" : "rule not-ok"}>1 uppercase letter</div>
                        <div className={passwordChecks.hasLower ? "rule ok" : "rule not-ok"}>1 lowercase letter</div>
                        <div className={passwordChecks.hasNumber ? "rule ok" : "rule not-ok"}>1 number</div>
                        <div className={passwordChecks.hasSpecial ? "rule ok" : "rule not-ok"}>1 special character</div>
                        <div className={passwordChecks.exactTen ? "rule ok" : "rule not-ok"}>Exactly 10 characters</div>
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary w-100">
                      Register
                    </button>
                  </>
                )}
              </form>

              <div className="success-message">{message}</div>

              <div
                className="link mt-2"
                onClick={() => {
                  setShowSignup(false);
                  setMessage("");
                  resetSignupOtpState();
                }}
              >
                Back
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}