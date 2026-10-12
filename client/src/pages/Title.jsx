const Title = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
};

export default Title; 