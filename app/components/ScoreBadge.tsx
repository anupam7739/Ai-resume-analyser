const ScoreBadge = ({ score }: { score: number }) => {
  const badge = score > 70
    ? { className: 'bg-badge-green text-green-600', label: 'Strong' }
    : score > 45
      ? { className: 'bg-badge-yellow text-yellow-600', label: 'Good Start' }
      : { className: 'bg-badge-red text-red-600', label: 'Needs Work' };

  return (
    <div className={`score-badge ${badge.className}`}>
      <p>{badge.label}</p>
    </div>
  );
};

export default ScoreBadge;