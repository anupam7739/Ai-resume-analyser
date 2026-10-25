import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";

const ResumeCard = ({ resume: {id, companyName, jobTitle, feedback, imagePath} }: { resume: Resume}) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    let objectUrl: string | undefined;

    const loadPreview = async () => {
      setResumeUrl("");
      setPreviewError(null);

      try {
        const blob = await fs.read(imagePath);
        if (!blob) throw new Error("Resume preview is unavailable.");

        objectUrl = URL.createObjectURL(blob);
        if (isCurrent) {
          setResumeUrl(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (loadError) {
        if (isCurrent) {
          setPreviewError(
            loadError instanceof Error
              ? loadError.message
              : "Resume preview is unavailable."
          );
        }
      }
    };

    void loadPreview();
    return () => {
      isCurrent = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fs, imagePath]);


  return (
    <Link to={`/resume/${id}`} className="resume-card mb-4 animate-in fade-in duration-1000">
      <div className="resume-card-header">
        <div className="flex flex-col gap2">
          {companyName && <h2 className= " !text-black font-bold break-words">
              {companyName}
          </h2>}
         {jobTitle && <h3 className = "text-lg break-words  text-gray-500">
              {jobTitle}
          </h3>}
          {!companyName && !jobTitle && <h2 className= "!text-black font-bold">Resume</h2>}
        </div>
        <div className="flex-shrink-0">
           <ScoreCircle score={feedback?.overallScore ?? 0} />
        </div>
      </div>


      {resumeUrl ? (
        <div className="gradient-border animate-in fade-in duration-1000">
        <div className="w-full h-full">
            <img
                src={resumeUrl}
                alt= "resume"
                className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"></img>
        </div>
        </div>
      ) : previewError ? (
      <div className="gradient-border flex h-[350px] items-center justify-center text-sm text-gray-500 max-sm:h-[200px]">
        {previewError}
      </div>
    ) : null}
    </Link>
  )
}

export default ResumeCard