import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import ScoreCircle from "~/components/ScoreCircle";

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
          feedback: Feedback;
        };
        if (!data.feedback) throw new Error("Resume feedback not found.");
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
        setFeedback(data.feedback);
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
                  <div className="flex items-center gap-4">
                    <ScoreCircle score={feedback.overallScore} />
                    <h3 className="text-2xl font-semibold">
                      Overall score: {feedback.overallScore}/100
                    </h3>
                  </div>
                  {(
                    [
                      ["ATS", feedback.ATS],
                      ["Tone and style", feedback.toneAndStyle],
                      ["Content", feedback.content],
                      ["Structure", feedback.structure],
                      ["Skills", feedback.skills],
                    ] as const
                  ).map(([title, category]) => (
                    <article key={title} className="flex flex-col gap-3">
                      <h3 className="text-xl font-semibold">
                        {title}: {category.score}/100
                      </h3>
                      <ul className="flex flex-col gap-3">
                        {category.tips.map((tip, index) => (
                          <li key={`${title}-${index}`}>
                            <p className="font-medium">{tip.tip}</p>
                            {"explanation" in tip && (
                              <p className="text-gray-600">{tip.explanation}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : (
                <p role="alert">Resume feedback is unavailable.</p>
              )}
            </section>
        </div>
    </main>
  )
}

export default Resume;