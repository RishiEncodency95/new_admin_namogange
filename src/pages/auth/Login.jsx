import React, { useState, useEffect, useRef } from "react";
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../utils/toastService";
import {
  loginWithPasswordThunk,
  resendOtpThunk,
  verifyOtpThunk,
} from "../../redux/slices/auth/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, otpStep, userIdForOtp } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const otpInputRef = useRef(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Timer logic for OTP countdown.
  // This effect runs when the OTP step becomes active, or when the user requests to resend the OTP.
  useEffect(() => {
    // Don't run if not on OTP step or if we can already resend.
    if (!otpStep || canResend) return;

    setTimer(30); // Reset timer to 30 seconds.

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otpStep, canResend]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username) {
      showError("Username is required");
      return;
    }
    if (!form.password) {
      showError("Password is required");
      return;
    }

    dispatch(
      loginWithPasswordThunk({
        username: form.username,
        password: form.password,
      }),
    )
      .unwrap()
      .then(() => {
        showSuccess("OTP sent successfully");
      })
      .catch((err) => {
        showError(err);
      });
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();

    const enteredOtp = otp;

    if (enteredOtp.length !== 6) {
      showError("Please enter 6-digit OTP");
      return;
    }

    dispatch(
      verifyOtpThunk({
        user_id: userIdForOtp,
        otp: enteredOtp,
      }),
    )
      .unwrap()
      .then(() => {
        showSuccess("OTP Verified Successfully");
        navigate("/dashboard");
      })
      .catch((err) => {
        showError(err);
        setOtp(""); // ✅ clear OTP on error
      });
  };

  const handleResendOtp = () => {
    if (!canResend) return;

    dispatch(
      resendOtpThunk({
        user_id: userIdForOtp,
      }),
    )
      .unwrap()
      .then(() => {
        showSuccess("OTP resent successfully");
        setCanResend(false); // This will re-trigger the timer useEffect
      })
      .catch((err) => {
        showError(err);
      });
  };

  // ======================
  // UI
  // ======================
  return (
    <div
      className="w-full h-screen flex items-center justify-center 
bg-gradient-to-r from-orange-200 via-cyan-200 to-blue-300"
    >
      <div className="flex flex-row bg-white shadow-xl rounded-xl overflow-hidden w-full max-w-4xl h-[70vh]">
        {/* Image Section */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="/login.png"
            alt="Ganges River"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
          {/* Logo */}
          <div className="w-full flex justify-center mb-4">
            <img
              src="/namo_gange.png"
              alt="logo"
              className="w-full h-auto rounded object-cover"
            />
          </div>

          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-1 tracking-wider">
            Namo Gange
          </h1>

          {/* ======================
            LOGIN SCREEN
        ====================== */}
          {!otpStep ? (
            <>
              <p className="text-sm text-gray-500 text-center mb-3">
                Please login to continue
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border px-3 rounded">
                    <FiUser className="text-gray-500 w-4 h-4 mr-2" />
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      className="w-full py-2 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border px-3 rounded">
                    <FiLock className="text-gray-500 w-4 h-4 mr-2" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="w-full py-2 text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 text-sm 
                font-semibold rounded hover:bg-blue-700 transition"
                >
                  {loading ? "Please wait..." : "Login"}
                </button>
              </form>
            </>
          ) : (
            /* ======================
              OTP SCREEN
          ====================== */
            <>
              <p className="text-sm text-gray-600 text-center mb-4">
                Please enter 6-digit OTP sent to your registered number
              </p>

              <form onSubmit={handleOtpSubmit}>
                <div
                  className="relative flex justify-center gap-2 sm:gap-3 cursor-text"
                  onClick={() => otpInputRef.current?.focus()}
                >
                  {[...Array(6)].map((_, index) => {
                    const isActive = index === otp.length;
                    return (
                      <div
                        key={index}
                        className={`w-10 h-12 sm:w-12 sm:h-14 border-b-2 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-700 transition-all duration-200 ${
                          isActive ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {otp[index] || ""}
                      </div>
                    );
                  })}
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    className="absolute top-0 left-0 w-full h-full bg-transparent opacity-0"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 mt-6 text-sm 
                font-semibold rounded hover:bg-blue-700 transition"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center mt-4 text-sm text-gray-600">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span>
                      Resend OTP in{" "}
                      <span className="font-semibold">{timer}s</span>
                    </span>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
