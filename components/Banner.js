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
  src: "/assets/banner.webp",
  alt: "Real Estate Banner",
};
const mobImage = {
  src: "/assets/banner.webp",
  alt: " Estate Banner",
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

    // persist in localStorage
    Object.entries(params).forEach(([k, v]) => {
      if (v) localStorage.setItem(k, v);
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
      terms: false,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full name is required"),
      phone: Yup.string().required("Phone number is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      lookingFor: Yup.string().required(
        "Please select what you're looking for"
      ),
      budget: Yup.string().required("Please select your budget range"),
      terms: Yup.boolean().oneOf([true], "You must accept the terms"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);

      // Pull UTM values from state or localStorage
      const getParam = (key) =>
        urlParams[key] ||
        (typeof window !== "undefined" && localStorage.getItem(key)) ||
        "";

      const formData = {
        ...values,
        utm_ad: getParam("utm_ad"),
        utm_placement: getParam("utm_placement"),
        gclid: getParam("gclid"),
        fbclid: getParam("fbclid"),
        utm_source: getParam("utm_source"),
        utm_campaign: getParam("utm_campaign"),
        utm_keyword: getParam("utm_keyword"),
      };

      // Convert to x‑www‑form‑urlencoded for Apps Script
      const body = new URLSearchParams();
      Object.entries(formData).forEach(([k, v]) => body.append(k, v));

      try {
        await fetch(
          "https://script.google.com/macros/s/AKfycbxaiKmSyu89fRV7gatOYZnLnF4e4KyLqHnV1TahkQDw5qil1Y55-pKp-juVk8KhO4bytw/exec",
          {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
          }
        );

        setStatus("Form submitted successfully!");
        resetForm();
        router.push("/thank-you");
      } catch (err) {
        console.error("Error submitting form", err);
        setStatus("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
        setTimeout(() => setStatus(""), 3000);
      }
    },
  });

  return (
    <div className="relative w-full overflow-hidden">
     {/* Desktop Banner */}
<div className="hidden md:block relative w-full aspect-[16/9] xl:h-[100vh] lg:aspect-[19/9]">
  <Image
    src={bannerImage.src}
    alt={bannerImage.alt}
    fill
    priority
    className="object-cover"
  />
</div>

{/* Mobile Banner */}
<div className="block md:hidden relative w-full aspect-[16/9]">
  <Image
    src={mobImage.src}
    alt={mobImage.alt}
    fill
    priority
    className="object-cover"
  />
</div>

      {/* Enquiry Form */}
      <div
        id="form"
        className="w-full px-2 pb-1 sm:px-6 xl:px-10 xl:absolute xl:top-[7vw] xl:right-[11vw] xl:justify-end z-20 flex justify-center mt-4 lg:mt-0"
      >
        <div className="w-full lg:max-w-full xl:max-w-[400px]">
          <div className="bg-white rounded-xl lg:shadow-xl p-4 sm:p-5 md:p-4 lg:p-2 xl:p-5 border border-gray-100">
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
                className={`text-center font-medium mb-4 text-sm ${
                  status.includes("success") ? "text-green-600" : "text-red-600"
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
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
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
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
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

              {/* Phone with react-phone-input-2 */}
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
                  inputClass={`!w-full border  !rounded-lg px-3 !py-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    formik.touched.lookingFor && formik.errors.lookingFor
                      ? "!border-red-500 1bg-red-50"
                      : "!border-gray-300"
                  } ${
                    formik.values.lookingFor
                      ? "!text-gray-800"
                      : "!text-gray-500"
                  }`}
                  buttonClass="!m-[1px] !bg-white !rounded-lg"
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
                  className={`w-full border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
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
                  className={`w-full border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
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
