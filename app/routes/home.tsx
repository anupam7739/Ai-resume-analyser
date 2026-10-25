import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import {  useNavigate,Link } from "react-router";
import { useEffect, useState } from "react";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
const { auth, kv, isLoading: isPuterLoading, puterReady } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes ] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const canShowResumes =
    puterReady && !isPuterLoading && auth.isAuthenticated;

  useEffect(() => {
   if (puterReady && !isPuterLoading && !auth.isAuthenticated) {
     navigate('/auth?next=/');
   }
  }, [auth.isAuthenticated, isPuterLoading, navigate, puterReady])

  useEffect(() => {
    if (!puterReady || isPuterLoading || !auth.isAuthenticated) return;

    let isCurrent = true;

    const loadResumes = async () => {
      setLoadingResumes(true);
      setResumeError(null);

      try {
        const items = await kv.list("resume:*", true);
        if (!items) throw new Error("Could not retrieve saved resumes.");

        const entries = items.filter(
          (item): item is KVItem =>
            typeof item === "object" &&
            item !== null &&
            "value" in item &&
            typeof item.value === "string"
        );
        if (entries.length !== items.length) {
          throw new Error("Saved resume data is in an unexpected format.");
        }

        const parsedResumes = entries.map(
          (item) => JSON.parse(item.value) as Resume
        );
        if (isCurrent) setResumes(parsedResumes);
      } catch (loadError) {
        if (isCurrent) {
          setResumeError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load saved resumes."
          );
        }
      } finally {
        if (isCurrent) setLoadingResumes(false);
      }
    }

    void loadResumes();
    return () => {
      isCurrent = false;
    };
  }, [auth.isAuthenticated, isPuterLoading, kv, puterReady]);

  return  <main className = "bg-[url('/images/bg-main.svg')] bg-cover">
   <Navbar />

   <section className= "main-section"> 
    <div className= "page-heading py-16">
      <h1>Track Your Application & Resume Rating</h1>
      {resumeError ? (
        <p role="alert" className="text-red-600">{resumeError}</p>
      ) : null}
      {canShowResumes && !loadingResumes && !resumeError && resumes.length === 0 ? (
        <h2>No resumes found upload your first resume to get feedback</h2>
      ): (
        <h2>Review your submission and check AI-powered feedback.</h2>
      )}
    </div>
    {(!puterReady || isPuterLoading || loadingResumes) && (
      <div className="flex flex-col item-center justify-center">
         <img src="/images/resume-scan-2.gif" className="w-[200px]" />
      </div>
    )}

   

   {canShowResumes && !loadingResumes && resumes.length > 0 && (
    <div className="resumes-section">

    {resumes.map((resume) => (
      <ResumeCard key={resume.id} resume={resume} />
   ))}
   </div>
  )}

  {canShowResumes && !loadingResumes && !resumeError && resumes.length === 0 && (
    <div className="flex flex-col items-center justify-center mt-10 gap-4">
      <Link to = "/upload" className="primary-button w-fit text-xl font-semibold" >
      Upload Resume
      </Link>
    </div>
  )}
</section>
   
    
   </main>; 
}
 