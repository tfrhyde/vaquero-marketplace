'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {
  setError('');

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) {
    setError('You must be logged in');
    return;
  }

  let image_url = '';
  if (image) {
    const fileName = `${uuidv4()}-${image.name}`;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, image);

    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    image_url = urlData.publicUrl;
  }

  const { error: insertError } = await supabase.from('Listings').insert([
    {
      user_id: user.id,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      item_location: form.location,
      image_url,
      sold: false,
    },
  ]);

  if (insertError) {
    setError(`Insert failed: ${insertError.message}`);
  } else {
    router.push('/');
  }
};


  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Post a New Listing</h1>
      <input name="title" placeholder="Title" className="input" onChange={handleChange} />
      <textarea name="description" placeholder="Description" className="input" onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" className="input" onChange={handleChange} />
      <input name="category" placeholder="Category (e.g., Electronics)" className="input" onChange={handleChange} />
      <input name="location" placeholder="Location (e.g., Edinburg)" className="input" onChange={handleChange} />
      <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} className="my-2" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}
