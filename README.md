# Vaquero Marketplace (Web Version)
This is the **web application** for Vaquero Marketplace, built with Next.js using TypeScript and Tailwind CSS.
It allows users to interact with listings, post items, and connect with Supabase as the backend.
Desktop Version: https://github.com/francisco-020/vaquero-desktop.git

---

## Tech Stack
- **Frontend:** Next.js (Using TypeScript). App Router, full-stack React framework
- **Styling** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Language:** TypeScript and CSS
- **Version Control:** Git + GitHub

## Setup Instruction 
### 1. Clone the repo
git clone https://github.com/tfrhyde/vaquero-marketplace.git

### 2. Move into the project folder
cd vaquero-marketplace

### (If .env.local file does not exist)
Create .env.local file in the same directory and fill sections below with the required keys
- NEXT_PUBLIC_SUPABASE_URL= 
- NEXT_PUBLIC_SUPABASE_ANON_KEY=
- SUPABASE_SERVICE_ROLE_KEY=

### 3. Run the development server
- npm run dev
- yarn dev
- pnpm dev
- bun dev

If not installed, install required and repeat the last step.

### 4. Open result
- Open http://localhost:3000 with your browser to see the result.

### (Optional) Deployment
- Deploy through Vercel or on other compatible deployment platforms

## Collaborator Github User Association
- celesterios0211: Celeste Rios
- francisco-020: Alan Sandoval
- tfrhyde: Carlos Herrera
- Troyrodz: Troy Rodriguez

## Contributors and Credit
- Celeste Rios: Partially worked on the backend of the desktop and web version, worked on the frontend of the desktop version, testing of both versions, and a portion of the planning of the project.
- Alan Sandoval: Worked developing both the backends of web and desktop version of the project, worked on the frontend structure of the web version, testing of both versions, and a portion of the planning of the project.
- Carlos Herrera: Initial work on the web version and setting up the database initially, worked on the frontend of web version, and a portion of the planning of the project.
- Troy Rodriguez: Miscellaneous assistance and commits, worked on search and filter features on both versions of the app.
