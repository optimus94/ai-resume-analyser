interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeColor = "";
  let badgeLabel = "";

  if (score > 70) {
    badgeColor = "bg-badge-green text-green-600";
    badgeLabel = "Strong";
  } else if (score>49) {
    badgeColor = "bg-badge-yellow text-yellow-600";
    badgeLabel = "Good Start";
  } else {
    badgeColor = "bg-badge-red text-red-600";
    badgeLabel = "Need Improvement";
  }

  return(
    <div className={`px-3 py-1 rounded-full ${badgeColor}`}>
        <p className="text-sm font-medium">{badgeLabel}</p>
    </div>
  )
};

export default ScoreBadge;
