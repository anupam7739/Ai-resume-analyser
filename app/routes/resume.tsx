import { Link, useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary"
import ATS from "~/components/ATS"
import Details from "~/components/Details"

export const meta = () => ([
    {title: 'Resumind | Review'},
    { name: 'description', content: 'Detailed overview of your resume'}
])


const Resume = () => {
  const { fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    let objectUrls: string[] = [];

    const loadResume = async () => {
      if (!id) {
        setError("Resume ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const resume = await kv.get(`resume:${id}`);
        if (!resume) throw new Error("Resume not found.");

        const data = JSON.parse(resume) as {
          resumePath: string;
          imagePath: string;
        };
        const [resumeBlob, imageBlob] = await Promise.all([
          fs.read(data.resumePath),
          fs.read(data.imagePath),
        ]);

        if (!resumeBlob || !imageBlob) {
          throw new Error("Failed to load the saved resume files.");
        }

        const pdfUrl = URL.createObjectURL(
          new Blob([resumeBlob], { type: "application/pdf" })
        );
        const previewUrl = URL.createObjectURL(imageBlob);
        objectUrls = [pdfUrl, previewUrl];

        if (!isCurrent) {
          objectUrls.forEach(URL.revokeObjectURL);
          return;
        }

        setResumeUrl(pdfUrl);
        setImageUrl(previewUrl);
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
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, [fs, id, kv]);

  return (
    <main className= '!pt-0'>
        <nav className="resume-nav">
          <Link to="/" className= "back-button">
             <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
             <span className= "text-grey-800 text-sm font-semibold">Back to Homepage</span>
          </Link>
        </nav>
        <div className="flex flex-row w-full max-lg:flex:col:reverse">
            <section className="feedback-section bg-[url('/images/bg-small.svg) bg-cover h-[100vh] sticky top-0 items-center justify-center]" >
              {isLoading ? (
                <p>Loading resume...</p>
              ) : error ? (
                <p role="alert">{error}</p>
              ) : imageUrl && resumeUrl ? (
               <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit">
                <a href= {resumeUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={imageUrl}
                    className="w-full h-full object-contain rounded-2xl"
                    alt="Resume preview"
                  />
                </a>
               </div>
              ) : null}
            </section>
            <section className="feedback-section">
              <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
              {feedback ? (
                <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                   <Summary feedback={feedback} />
                   <ATS score={feedback.ATS.score || 0} suggestions= {feedback.ATS.tips || []} />
                   <Details feedback= {feedback} />
                </div>
              ) : (
                <img src="/images/resume-scan-2.gif" className="w-full " />
              )}
            </section>
        </div>
    </main>
  )
}

export default Resume;