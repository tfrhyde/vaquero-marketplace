'use client'; // Client component
// we use react hook (state) and next.js router 
// call supabase browers auth. Needs to be done on client component

import { useState } from 'react'; // tracks user typing, only work in client components
import { useRouter } from 'next/navigation'; // used to redirect user programmatic redirecting
import { supabase } from '@/lib/supabaseClient'; // Supabase client for signing up the user

// React component that renders a login form and handles supabase email/password
export default function LoginForm() {
  const router = useRouter();
 // Each field starts as '' and updates via its setter scheduling a re-render
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // form error message

  // Async function to await the remote authentication call
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/account');
    }
  };

  return (
    // Form element: pressing enter or clicking the submit button triggers the onSubmit
    <form onSubmit={handleLogin} className="flex flex-col space-y-3">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded px-3 py-2"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white rounded px-4 py-2 font-bold transition"
      >
        Log In
      </button>
    </form>
  );
}
