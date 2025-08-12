"use client"; // using 'use client' so we can render this page on the client side
// because this interaction requires browser only logic

import { useState } from "react"; // tracks user typing, only work in client components
import { useRouter } from "next/navigation"; // used to redirect user programmatic redirecting
import { supabase } from "@/lib/supabaseClient"; // Supabase client for signing up the user

// Defines the expected prop for this component
// setSuccesMessage is a function passed from the parent that updates a string state
interface SignupFormProps {
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
}

// Files default export will be used in landing page for user sign up. (import SignupForm)
// Props are destructed to get "setSuccessMessage"
// State setter is passed down from the parent to show success message
// TypeScript parameter type ":SignupFormProps" ensures SignupForm receives correct object type
// set in the interface
export default function SignupForm({ setSuccessMessage }: SignupFormProps) {
  const router = useRouter();
  // Each field starts as '' and updates via its setter scheduling a re-render
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // async function so we can better handle remote work (wait for supabase to create your account)
  // Pausing the handler so we dont redirect or show a success message to early.
  // Helpful for UX as well lets us display a loading state
  const handleSignup = async (e: React.FormEvent) => {
    // Prevent the normal form submission (which would reload the page).
    // This keeps the user’s typed values and lets us run our async Supabase signup + show errors/spinners.
    // Without this user entries or errors would dissapear 
    e.preventDefault();
    setError(""); // error clear

    // send sign up request to supabase and wait for the result
    // pass email/password and also store first and last name in user_metadata
    // Resonse gives us data like user/session or an error if signup failed
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      // Email confirmation is disabled, so session is active
      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/account");
      }, 1500);
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col space-y-3">
      <input
      // Typing trigger onChange which updates the state and react re renders new text into value and UI
      // shows latest text
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="input"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
{/* trigger the forms submit event "onSubmit={handleSignup}"*/}
      <button
        type="submit" 
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded w-full transition"
      >
        Sign Up
      </button>
    </form>
  );
}
