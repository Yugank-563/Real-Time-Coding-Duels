const Logo = ({ className = "" }) => {
  return (
    <div
      className={`relative flex items-center justify-center w-10 h-10 ${className}`}
    >
      <img 
        src="/favicon-dark.svg" 
        alt="Coduelo Logo" 
        className="w-full h-full object-contain drop-shadow-md"
      />
    </div>
  );
};

export default Logo;
