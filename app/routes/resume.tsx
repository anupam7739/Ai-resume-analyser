import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary"
import ATS from "~/components/ATS"
import Details from "~/components/Details"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isTip = (value: unknown): value is Feedback["ATS"]["tips"][number] =>
  isRecord(value) &&
  (value.type === "good" || value.type === "improve") &&
  typeof value.tip === "string";

const isCategoryTip = (
  value: unknown
): value is Feedback["toneAndStyle"]["tips"][number] =>
  isRecord(value) &&
  (value.type === "good" || value.type === "improve") &&
  typeof value.tip === "string" &&
  typeof value.explanation === "string";

const isCategoryFeedback = (
  value: unknown
): value is Feedback["toneAndStyle"] =>
  isRecord(value) &&
  typeof value.score === "number" &&
  Number.isFinite(value.score) &&
  Array.isArray(value.tips) &&
  value.tips.every(isCategoryTip);

const isFeedback = (value: unknown): value is Feedback =>
  isRecord(value) &&
  typeof value.overallScore === "number" &&
  Number.isFinite(value.overallScore) &&
  isRecord(value.ATS) &&
  typeof value.ATS.score === "number" &&
  Number.isFinite(value.ATS.score) &&
  Array.isArray(value.ATS.tips) &&
  value.ATS.tips.every(isTip) &&
  isCategoryFeedback(value.toneAndStyle) &&
  isCategoryFeedback(value.content) &&
  isCategoryFeedback(value.structure) &&
  isCategoryFeedback(value.skills);

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

        const data: unknown = JSON.parse(resume);
        if (
          !isRecord(data) ||
          typeof data.resumePath !== "string" ||
          typeof data.imagePath !== "string"
        ) {
          throw new Error("Saved resume data is invalid.");
        }
        if (!isFeedback(data.feedback)) {
          throw new Error(
            "Resume analysis is missing or invalid. Please upload and analyze the resume again."
          );
        }

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
              {isLoading ? (
                <p>Loading resume analysis...</p>
              ) : error ? (
                <p role="alert">{error}</p>
              ) : feedback ? (
                <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                   <Summary feedback={feedback} />
                   <ATS score={feedback.ATS.score || 0} suggestions= {feedback.ATS.tips || []} />
                   <Details feedback= {feedback} />
                </div>
              ) : (
                <p role="alert">Resume analysis is unavailable.</p>
              )}
            </section>
        </div>
    </main>
  )
}

export default Resume;