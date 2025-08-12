"use client";
import "./globals.css";

import { useState } from "react";
import { motion } from "framer-motion";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";

// Fade in text using Framer Motion (staggered characters)
const typeContainer = {
  hidden: { opacity: 1 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { delay, staggerChildren: 0.035 },
  }),
};

const typeChar = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
};

function FadeInText({
  text,
  className,
  delay = 0.5,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.p
      className={className}
      variants={typeContainer}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          variants={typeChar}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <main className="min-h-screen flex bg-gray-100">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex w-1/2 bg-orange-500 items-start justify-center pt-12 pb-10 px-10"
      >
        <div className="text-center text-white font-times">
          <motion.img
            src="/Vaquero Head.png" 
            alt="School Mascot"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mx-auto mb-4 h-20 w-auto drop-shadow"
          />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-6xl font-bold mb-4"
          >
            Vaquero Marketplace
          </motion.h2>
          <FadeInText
            text="Buy, Sell, and Trade with fellow students"
            className="text-lg"
            delay={0.4}
          />

          <motion.img
            src="/Vaquero Desktop App Landing Page Image.jpg"
            alt="Marketplace"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 w-full max-w-xl rounded shadow-md"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-1/2 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white shadow-xl rounded-lg p-10 w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full mb-3">
              <img src="/UTRGV Logo.png" alt="Auth Icon" className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </h2>
          </div>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-green-600 font-semibold text-center"
            >
              {successMessage}
            </motion.div>
          )}

          {mode === "signin" ? (
            <>
              <LoginForm />
              <div className="mt-6 text-center">
                <p className="mb-2 text-sm">Don't have an account?</p>
                <button
                  onClick={() => setMode("signup")}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded px-4 py-2 font-bold transition w-full"
                >
                  Create new account
                </button>
              </div>
            </>
          ) : (
            <>
              <SignupForm setSuccessMessage={setSuccessMessage} />
              <div className="mt-6 text-center">
                <p className="mb-2 text-sm">Already have an account?</p>
                <button
                  onClick={() => setMode("signin")}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded px-4 py-2 font-bold transition"
                >
                  Sign In
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
