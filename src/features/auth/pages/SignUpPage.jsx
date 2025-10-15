// SignUpPage.jsx
// This file defines the SignUpPage component for user registration.
// It handles user signup form, validation, API calls, and redirects to email verification.
import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import FormField from "../../../components/FormField";
import Dropdown from "../../../components/Dropdown";
import { signUpSchema } from "../../auth/services/authValidation";
import { register } from "../../auth/services/authApi";
import GoogleIcon from "../../../assets/devicon_google.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Logo } from "../../../layout/Header/Header";

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const initialState = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
  country: "",
  city: "",
  address: "",
  dateOfBirth: "",
  gender: "",
};

function SignUpPage() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiErrorList, setApiErrorList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const sixteenYearsAgo = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 16);
    return d;
  })();
  const maxDob = formatDate(sixteenYearsAgo);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError("");
    setApiErrorList([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setApiError("");
    setApiErrorList([]);
    console.log("Submitting form...");
    try {
      // Enforce minimum age of 16
      if (form.dateOfBirth) {
        const dob = new Date(form.dateOfBirth);
        if (isNaN(dob.getTime())) {
          setErrors((prev) => ({
            ...prev,
            dateOfBirth: "Please provide a valid date of birth",
          }));
          setSubmitting(false);
          return;
        }
        const ageCutoff = new Date();
        ageCutoff.setFullYear(ageCutoff.getFullYear() - 16);
        if (dob > ageCutoff) {
          setErrors((prev) => ({
            ...prev,
            dateOfBirth: "You must be at least 16 years old",
          }));
          setSubmitting(false);
          return;
        }
      }
      const value = await signUpSchema.validateAsync(form, {
        abortEarly: false,
      });
      console.log("Validation passed:", value);
      const payload = {
        email: value.email,
        password: value.password,
        confirmPassword: value.confirmPassword,
        firstName: value.firstName,
        lastName: value.lastName,
        phoneNumber: value.phone,
        gender: value.gender,
        dateOfBirth: value.dateOfBirth,
        country: value.country,
        city: value.city,
        address: value.address,
      };
      console.log("Payload to send:", payload);
      await register(payload);
      setForm(initialState);
      console.log("Registration successful, navigating to verify-email");
      navigate("/verify-email", { state: { email: value.email } });
    } catch (err) {
      console.log("Error during submit:", err);
      if (err.isJoi && err.details) {
        const fieldErrors = {};
        err.details.forEach((d) => {
          fieldErrors[d.path[0]] = d.message;
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(err)) {
        if (err.response && err.response.data && err.response.data.message) {
          const msg = err.response.data.message;
          if (msg.includes(",")) {
            setApiErrorList(msg.split(",").map((e) => e.trim()));
          } else {
            setApiError(msg);
          }
        } else if (err.code === "ECONNABORTED") {
          setApiError("Request timed out. Please try again.");
        } else {
          setApiError("A network error occurred. Please try again.");
        }
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
      console.log("Submit finished.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--color-background)] px-2 py-8">
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Go to home"
        className="mb-4"
      >
        <Logo showText={false} iconClassName="w-16 h-16 md:w-20 md:h-20" />
      </button>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-[color:var(--color-background)] rounded-2xl shadow-[0_2px_16px_0_var(--color-shadow)]  px-6 py-8 flex flex-col items-center"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Create An Account
        </h2>
        <p className="text-center text-[color:var(--color-secondary-text)] text-sm mb-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-blue-600 underline">
            User Agreement
          </a>{" "}
          and acknowledge that you understand the{" "}
          <a href="#" className="text-blue-600 underline">
            Privacy Policy
          </a>
          .
        </p>
        <button
          type="button"
          className="flex items-center justify-center w-full text-black rounded-full py-2 mb-4 bg-white   transition"
        >
          <img src={GoogleIcon} alt="Google" className="w-5 h-5 mr-2" />
          Continue with Google
        </button>
        <div className="flex items-center w-full my-4">
          <div className="flex-1 h-px bg-[color:var(--color-muted)]" />
          <span className="mx-2 text-[color:var(--color-secondary-text)] text-xs font-medium">
            OR
          </span>
          <div className="flex-1 h-px bg-[color:var(--color-muted)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4">
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            error={errors.email}
            placeholder="Email"
          />
          <FormField
            label="Phone Number"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            required
            error={errors.phone}
            placeholder="Phone Number"
          />
          <FormField
            label="First Name"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            required
            error={errors.firstName}
            placeholder="First Name"
          />
          <FormField
            label="Country"
            name="country"
            type="text"
            value={form.country}
            onChange={handleChange}
            error={errors.country}
            placeholder="Country"
          />
          <FormField
            label="Last Name"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            required
            error={errors.lastName}
            placeholder="Last Name"
          />
          <FormField
            label="City"
            name="city"
            type="text"
            value={form.city}
            onChange={handleChange}
            error={errors.city}
            placeholder="City"
          />

          <div className="relative">
            <FormField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              error={errors.password}
              placeholder="Password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-8 text-lg text-gray-500 focus:outline-none"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="relative">
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              error={errors.confirmPassword}
              placeholder="Confirm Password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-8 text-lg text-gray-500 focus:outline-none"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <FormField
            label="Address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            required
            error={errors.address}
            placeholder="Address"
          />
          <FormField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
            error={errors.dateOfBirth}
            placeholder="Date of Birth"
            max={maxDob}
          />
        </div>
        <Dropdown
          options={genderOptions}
          value={form.gender}
          onChange={(e) =>
            handleChange({ target: { name: "gender", value: e.target.value } })
          }
          error={errors.gender}
          required
          placeholder="Gender"
          className="mb-4 w-full"
          name="gender"
        />
        <div className="w-full flex justify-between items-center text-sm mb-4">
          <span>
            Already have an account?{" "}
            <button
              type="button"
              className="text-blue-600 font-medium hover:underline"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
          </span>
        </div>
        <button
          type="submit"
          className="w-full bg-[color:var(--color-primary)] hover:bg-[color:var(--color-accent)] text-white font-semibold py-3 rounded-full text-lg transition  disabled:opacity-50"
          disabled={submitting}
        >
          Sign Up
        </button>
        <button
          type="button"
          className="text-blue-600 font-medium hover:underline mt-4"
          onClick={() => navigate("/")}
        >
          Back To Home
        </button>
        {apiError && (
          <div className="w-full mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center text-sm font-medium">
            {apiError}
          </div>
        )}
        {apiErrorList.length > 0 && (
          <ul className="w-full mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-left text-sm font-medium list-disc list-inside">
            {apiErrorList.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
}

export default SignUpPage;
