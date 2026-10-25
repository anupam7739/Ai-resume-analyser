import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordian";
import { cn } from "~/lib/utils";

type CategoryTip = Feedback["toneAndStyle"]["tips"][number];

const ScoreBadge = ({ score }: { score: number }) => {
  const style = score > 69
    ? {
        color: "bg-green-100 text-green-700",
        icon: (
          <path
            d="m5 12 4 4L19 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      }
    : score > 39
      ? {
          color: "bg-yellow-100 text-yellow-700",
          icon: (
            <path
              d="M12 8v4m0 4h.01M10.3 3.9 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ),
        }
      : {
          color: "bg-red-100 text-red-700",
          icon: (
            <path
              d="M12 8v4m0 4h.01M10.3 3.9 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ),
        };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        style.color
      )}
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        {style.icon}
      </svg>
      {score}/100
    </span>
  );
};

const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => (
  <div className="flex w-full items-center justify-between gap-4">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <ScoreBadge score={categoryScore} />
  </div>
);

const CategoryContent = ({ tips }: { tips: CategoryTip[] }) => (
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {tips.map((tip, index) => (
        <div
          key={`${tip.type}-${index}`}
          className="flex items-start gap-2 rounded-xl bg-gray-50 p-3"
        >
          <svg
            aria-hidden="true"
            className={cn(
              "mt-0.5 h-5 w-5 shrink-0",
              tip.type === "good" ? "text-green-600" : "text-amber-600"
            )}
            fill="none"
            viewBox="0 0 24 24"
          >
            {tip.type === "good" ? (
              <path
                d="m5 12 4 4L19 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M12 8v4m0 4h.01M10.3 3.9 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
          <p className="text-sm font-medium text-gray-800">{tip.tip}</p>
        </div>
      ))}
    </div>

    <div className="flex flex-col gap-3">
      {tips.map((tip, index) => (
        <div
          key={`${tip.type}-explanation-${index}`}
          className={cn(
            "rounded-xl border p-4",
            tip.type === "good"
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          )}
        >
          <p
            className={cn(
              "text-sm font-semibold",
              tip.type === "good" ? "text-green-800" : "text-amber-800"
            )}
          >
            {tip.tip}
          </p>
          <p className="mt-1 text-sm text-gray-700">{tip.explanation}</p>
        </div>
      ))}
    </div>
  </div>
);

const Details = ({ feedback }: { feedback: Feedback }) => {
  const categories: {
    id: string;
    title: string;
    feedback: Feedback["toneAndStyle"];
  }[] = [
    { id: "tone-style", title: "Tone & Style", feedback: feedback.toneAndStyle },
    { id: "content", title: "Content", feedback: feedback.content },
    { id: "structure", title: "Structure", feedback: feedback.structure },
    { id: "skills", title: "Skills", feedback: feedback.skills },
  ];

  return (
    <Accordion
      defaultOpen="tone-style"
      className="rounded-2xl border border-gray-100 bg-white px-4 shadow-sm"
    >
      {categories.map((category) => (
        <AccordionItem key={category.id} id={category.id}>
          <AccordionHeader itemId={category.id} className="px-0">
            <CategoryHeader
              title={category.title}
              categoryScore={category.feedback.score}
            />
          </AccordionHeader>
          <AccordionContent itemId={category.id} className="px-0">
            <CategoryContent tips={category.feedback.tips} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default Details;
