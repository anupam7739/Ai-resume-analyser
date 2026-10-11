import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

interface SavedResume {
  id: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
}

export default function ResumeDetails() {
  const { id } = useParams();
  const { kv } = usePuterStore();
  const [resume, setResume] = useState<SavedResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadResume = async () => {
      if (!id) {
        setError("Resume ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const savedResume = await kv.get(`resume:${id}`);
        if (!savedResume) {
          if (isCurrent) setError("Resume not found.");
          return;
        }

        const parsedResume = JSON.parse(savedResume) as SavedResume;
        if (isCurrent) setResume(parsedResume);
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load resume."
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadResume();
    return () => {
      isCurrent = false;
    };
  }, [id, kv]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />
      <section className="main-section">
        {isLoading ? (
          <p className="py-16">Loading resume...</p>
        ) : error ? (
          <div className="py-16">
            <p role="alert">{error}</p>
            <Link to="/" className="primary-button mt-4 inline-block">
              Back to resumes
            </Link>
          </div>
        ) : resume ? (
          <div className="py-16">
            <h1>{resume.companyName || "Resume review"}</h1>
            <h2 className="mt-2">{resume.jobTitle}</h2>
            <p className="mt-4">Overall score: {resume.feedback.overallScore}</p>
            <img
              src={resume.imagePath}
              alt={`${resume.jobTitle} resume preview`}
              className="mt-8 w-full max-w-3xl"
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
