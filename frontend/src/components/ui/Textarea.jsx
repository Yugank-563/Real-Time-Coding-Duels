const Textarea = ({
  label, id, name, value, onChange,
  placeholder, required, error, rows = 3, headerRight,
  className = '', ...props
}) => {
  return (
    <div className="input-wrapper">
      {(label || headerRight) && (
        <div className="form-label-row">
          {label && (
            <label htmlFor={id || name} className="form-label">{label}</label>
          )}
          {headerRight}
        </div>
      )}

      <div className="relative">
        <textarea
          id={id || name} name={name}
          value={value} onChange={onChange} placeholder={placeholder}
          required={required} rows={rows}
          className={`input resize-y min-h-[80px] ${error ? 'input--error' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Textarea;
