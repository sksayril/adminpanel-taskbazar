interface StatsCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  bgColor: string;
}

const StatsCard = ({ icon, value, label, bgColor }: StatsCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
      <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
};

export default StatsCard;
