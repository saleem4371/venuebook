"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import PremiumButton from "./PremiumButton";
import GlobalModal from "./GlobalModal";

export default function KYCModal({ open, setOpen }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    pan: "",
    aadhaar: "",
    panFile: null,
    aadhaarFile: null,
    bankName: "",
    accountNumber: "",
    ifsc: "",
    accountType: "",
    businessType: "",
  });

  const handleNext = () => {
    if (step === 1) {
      if (!form.pan || !form.aadhaar || !form.panFile || !form.aadhaarFile) {
        toast.error("Please complete KYC details");
        return;
      }
    }

    if (step === 2) {
      if (!form.bankName || !form.accountNumber || !form.ifsc) {
        toast.error("Fill all bank details");
        return;
      }
    }

    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success("KYC Submitted Successfully 🎉");
      setOpen(false);
      setStep(1);
    }, 2000);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <input
              placeholder="PAN Number"
              className="input"
              onChange={(e) => setForm({ ...form, pan: e.target.value })}
            />

            <input
              placeholder="Aadhaar Number"
              className="input"
              onChange={(e) => setForm({ ...form, aadhaar: e.target.value })}
            />

            <Upload
              label="Upload PAN"
              onChange={(file) => setForm({ ...form, panFile: file })}
            />

            <Upload
              label="Upload Aadhaar"
              onChange={(file) => setForm({ ...form, aadhaarFile: file })}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <input
              placeholder="Bank Name"
              className="input"
              onChange={(e) =>
                setForm({ ...form, bankName: e.target.value })
              }
            />

            <input
              placeholder="Account Number"
              className="input"
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
            />

            <input
              placeholder="IFSC Code"
              className="input"
              onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <select
              className="input"
              onChange={(e) =>
                setForm({ ...form, accountType: e.target.value })
              }
            >
              <option>Account Type</option>
              <option>Savings</option>
              <option>Current</option>
            </select>

            <select
              className="input"
              onChange={(e) =>
                setForm({ ...form, businessType: e.target.value })
              }
            >
              <option>Business Type</option>
              <option>Individual</option>
              <option>Company</option>
            </select>

            {/* Summary */}
            <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl">
              <p><b>PAN:</b> {form.pan}</p>
              <p><b>Aadhaar:</b> {form.aadhaar}</p>
              <p><b>Bank:</b> {form.bankName}</p>
              <p><b>Account:</b> {form.accountNumber}</p>
              <p><b>IFSC:</b> {form.ifsc}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Toaster position="top-right" />

       <GlobalModal open={open} onClose={() => setOpen(false)}>

       
              {/* Header */}
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  KYC Verification
                </h2>
              </div>

              {/* Steps */}
              <div className="flex justify-between mb-6 text-sm">
                {["KYC", "Bank", "Verify"].map((s, i) => (
                  <div
                    key={i}
                    className={`flex-1 text-center ${
                      step === i + 1
                        ? "text-white font-semibold bg-blue-500"
                        : "text-white bg-gray-300"
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>

              {renderStep()}

              {/* Footer */}
              <div className="flex justify-between mt-6">
  {step > 1 && (
    <PremiumButton
      variant="secondary"
      onClick={() => setStep(step - 1)}
    >
      Back
    </PremiumButton>
  )}

  {step < 3 ? (
    <PremiumButton onClick={handleNext}>
      Continue
    </PremiumButton>
  ) : (
    <PremiumButton loading={loading} onClick={handleSubmit}>
      Submit KYC
    </PremiumButton>
  )}
</div>

            </GlobalModal>
    </>
  );
}

function Upload({ label, onChange }) {
  const [preview, setPreview] = useState(null);

  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>

      <input
        type="file"
        className="hidden"
        id={label}
        onChange={(e) => {
          const file = e.target.files[0];
          setPreview(URL.createObjectURL(file));
          onChange(file);
        }}
      />

      <label
        htmlFor={label}
        className="block p-4 border border-dashed rounded-xl text-center cursor-pointer hover:bg-white/30"
      >
        {preview ? (
          <img src={preview} className="h-24 mx-auto rounded" />
        ) : (
          "Click to upload"
        )}
      </label>
    </div>
  );
}


