"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Banner image
const bannerImage = {
  src: "/assets/lagosdesk.jpeg",
  alt: "Desktop Banner",
};
const mobImage = {
  src: "/assets/lagosmob.jpeg",
  alt: " Mobile Banner",
};
// Property type options
const propertyTypes = ["Villa", "Apartment", "Penthouse", "Townhouse"];

// Budget options
const budgetOptions = [
  "Under $500,000",
  "$500,000 - $700,000",
  "$700,000 and Above",
];

export default function Banner() {
  const router = useRouter();

  /* ――― State & helpers ――― */
  const [urlParams, setUrlParams] = useState({
    utm_ad: "",
    utm_placement: "",
    gclid: "",
    fbclid: "",
    utm_source: "",
    utm_campaign: "",
    utm_keyword: "",
  });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Extract & persist UTM parameters ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = new URLSearchParams(window.location.search);
    const params = {
      utm_ad: query.get("utm_ad") || "",
      utm_placement: query.get("utm_placement") || "",
      gclid: query.get("gclid") || "",
      fbclid: query.get("fbclid") || "",
      utm_source: query.get("utm_source") || "",
      utm_campaign: query.get("utm_campaign") || "",
      utm_keyword: query.get("utm_keyword") || "",
    };

    setUrlParams(params);

    // persist in localStorage - only if values exist
    Object.entries(params).forEach(([k, v]) => {
      if (v && typeof window !== "undefined") {
        try {
          localStorage.setItem(k, v);
        } catch (error) {
          console.warn(`Failed to save ${k} to localStorage:`, error);
        }
      }
    });
  }, []);

  // ── Formik setup ──
  const formik = useFormik({
    initialValues: {
      fullName: "",
      phone: "",
      email: "",
      lookingFor: "",
      budget: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .min(2, "Full name must be at least 2 characters")
        .required("Full name is required"),
      phone: Yup.string()
        .min(10, "Phone number must be at least 10 digits")
        .required("Phone number is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      lookingFor: Yup.string().required(
        "Please select what you're looking for"
      ),
      budget: Yup.string().required("Please select your budget range"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      setStatus("");

      // Pull UTM values from state or localStorage with better error handling
      const getParam = (key) => {
        try {
          return urlParams[key] || 
                 (typeof window !== "undefined" && localStorage.getItem(key)) || 
                 "";
        } catch (error) {
          console.warn(`Failed to get ${key} from localStorage:`, error);
          return urlParams[key] || "";
        }
      };

      // Prepare form data with proper structure
      const formData = {
        // Main form fields
        fullName: values.fullName.trim(),
        phone: values.phone,
        email: values.email.trim().toLowerCase(),
        lookingFor: values.lookingFor,
        budget: values.budget,
        
        // UTM and tracking parameters
        utm_ad: getParam("utm_ad"),
        utm_placement: getParam("utm_placement"),
        gclid: getParam("gclid"),
        fbclid: getParam("fbclid"),
        utm_source: getParam("utm_source"),
        utm_campaign: getParam("utm_campaign"),
        utm_keyword: getParam("utm_keyword"),
        
        // Additional metadata
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
        referrer: typeof window !== "undefined" ? document.referrer : "",
      };


      try {
        // Convert to x‑www‑form‑urlencoded for Apps Script
        const body = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
          body.append(key, String(value || ""));
        });


        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbzuhJDxvpamy_JnzGowhsxlvVHbVfN0iiKRXcd6faX0y2sZEbKJ8SJvZeyxB9ZVoN5z/exec",
          {
            method: "POST",
            mode: "no-cors", // Note: This prevents reading the response
            headers: { 
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
          }
        );

        // Since mode is 'no-cors', we can't read the response
        // We'll assume success if no error is thrown
        resetForm();
        
        // Redirect after successful submission
        setTimeout(() => {
          router.push("/thank-you");
        }, 2000);

      } catch (error) {
        console.error("Error submitting form:", error);
        setStatus("Something went wrong. Please try again or contact us directly.");
      } finally {
        setIsSubmitting(false);
        // Clear status after 5 seconds
        setTimeout(() => setStatus(""), 5000);
      }
    },
  });

  return (
    <div className="relative w-full overflow-hidden">
      {/* Desktop Banner */}
      <div className="hidden lg:block relative w-full aspect-[16/9] lg:aspect-[19/9]">
        <Image
          src={bannerImage.src}
          alt={bannerImage.alt}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1280px) 100vw, (min-width: 1024px) 100vw, 100vw"
        />
      </div>

      {/* Mobile Banner */}
      <div className="lg:hidden block relative w-full h-full">
        <Image
          src={mobImage.src}
          alt={mobImage.alt}
          width={768}
          height={500}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Enquiry Form */}
      <div
        id="form"
        className="w-full px-2 pb-1 sm:px-6 xl:px-10 xl:absolute xl:top-[5vw] xl:right-[11vw] xl:justify-end z-20 flex justify-center lg:mt-4 "
      >
        <div className="w-full lg:max-w-full xl:max-w-[400px]">
          <div className="bg-white lg:rounded-xl lg:shadow-xl p-4 sm:p-5 md:p-4 lg:p-2 xl:p-5 md:border border-gray-100">
            {/* Header */}
            <div className="text-center mb-4 md:mb-3">
              <h2 className="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-2">
                ENQUIRE NOW
              </h2>
              <p className="text-sm sm:text-xs md:text-sm text-gray-600 leading-relaxed">
                Simply fill in the enquiry form below and we&apos;ll be in touch
                with you soon to help you find your dream property!
              </p>
            </div>

            {/* Status */}
            {status && (
              <div
                className={`text-center font-medium mb-4 text-sm p-3 rounded-lg ${
                  status.includes("success") || status.includes("successfully")
                    ? "text-green-700 bg-green-50 border border-green-200" 
                    : "text-red-700 bg-red-50 border border-red-200"
                }`}
              >
                {status}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-2 md:space-y-2 lg:space-y-3 xl:space-y-5"
            >
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name *"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.fullName}
                  className={`w-full border rounded-lg !text-gray-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    formik.touched.fullName && formik.errors.fullName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className={`w-full border rounded-lg px-3 !text-gray-800 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Phone with react-phone-input-2 - FIXED */}
              <div>
                <PhoneInput
                  country={"us"}
                  value={formik.values.phone}
                  onChange={(phone) => formik.setFieldValue("phone", phone)}
                  onBlur={() => formik.setFieldTouched("phone", true)}
                  inputProps={{
                    name: "phone",
                    required: true,
                    placeholder: "Phone Number *",
                  }}
                  containerClass={`w-full ${
                    formik.touched.phone && formik.errors.phone
                      ? "phone-error"
                      : ""
                  }`}
                  inputClass={`!w-full !text-gray-800 border !rounded-lg px-3 !py-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    formik.touched.phone && formik.errors.phone
                      ? "!border-red-500 !bg-red-50"
                      : "!border-gray-300"
                  }`}
                  buttonClass="!m-[1px] !text-gray-800 !bg-white !rounded-lg"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              {/* What are you looking for */}
              <div>
                <select
                  name="lookingFor"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lookingFor}
                  className={`w-full border rounded-lg  px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    formik.touched.lookingFor && formik.errors.lookingFor
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } ${
                    formik.values.lookingFor ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  <option value="" disabled>
                    What are you looking for? *
                  </option>
                  {propertyTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {formik.touched.lookingFor && formik.errors.lookingFor && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.lookingFor}
                  </p>
                )}
              </div>

              {/* Budget */}
              <div>
                <select
                  name="budget"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.budget}
                  className={`w-full border rounded-lg px-3  py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    formik.touched.budget && formik.errors.budget
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } ${
                    formik.values.budget ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  <option value="" disabled>
                    What is your budget? *
                  </option>
                  {budgetOptions.map((budget, index) => (
                    <option key={index} value={budget}>
                      {budget}
                    </option>
                  ))}
                </select>
                {formik.touched.budget && formik.errors.budget && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.budget}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md text-sm ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-900 hover:bg-blue-800 text-white"
                }`}
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT ENQUIRY"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Custom styles for phone input error state */}
      <style jsx global>{`
        .phone-error .react-tel-input .form-control {
          border-color: #ef4444 !important;
          background-color: #fef2f2 !important;
        }
      `}</style>
    </div>
  );
}