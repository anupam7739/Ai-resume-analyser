type Suggestion = {
  type: 'good' | 'improve';
  tip: string;
};

type ATSProps = {
  score: number;
  suggestions: Suggestion[];
};

const ATS = ({ score, suggestions }: ATSProps) => {
  const scoreStyle = score > 69
    ? {
        background: 'from-green-100',
        icon: '/icon/ats-good%20(2).svg',
        description: 'Your resume is well-positioned to work with Applicant Tracking Systems.',
      }
    : score > 49
      ? {
          background: 'from-yellow-100',
          icon: '/icon/ats-warning%20(2).svg',
          description: 'Your resume has a good foundation, with a few opportunities to improve ATS compatibility.',
        }
      : {
          background: 'from-red-100',
          icon: '/icon/ats-bad.svg',
          description: 'Your resume may need some improvements to pass through Applicant Tracking Systems.',
        };

  return (
    <div className={`rounded-2xl border border-gray-100 bg-gradient-to-br ${scoreStyle.background} to-white p-6 shadow-sm`}>
      <div className="flex items-center gap-4">
        <img src={scoreStyle.icon} alt="" className="h-10 w-10" />
        <h3 className="text-xl font-semibold text-gray-900">
          ATS Score - {score}/100
        </h3>
      </div>

      <div className="mt-5">
        <h4 className="font-semibold text-gray-800">ATS Compatibility</h4>
        <p className="mt-1 text-sm text-gray-600">{scoreStyle.description}</p>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {suggestions.map((suggestion, index) => (
          <li key={`${suggestion.type}-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
            <img
              src={suggestion.type === 'good' ? '/icon/check%20(2).svg' : '/icon/warning%20(2).svg'}
              alt=""
              className="mt-0.5 h-5 w-5 shrink-0"
            />
            <span>{suggestion.tip}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm font-medium text-gray-700">
        Keep refining your resume to make it even more ATS-friendly.
      </p>
    </div>
  )
}

export default ATS