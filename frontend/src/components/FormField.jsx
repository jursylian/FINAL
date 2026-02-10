import React, { forwardRef } from "react";

const inputClass =
  "rounded-xl border border-[#DBDBDB] bg-white px-4 py-2.5 text-[14px] text-[#262626] outline-none transition focus:border-[#A8A8A8]";

const FormField = forwardRef(function FormField({ label, error, as = "input", ...rest }, ref) {
  const Component = as;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[16px] font-semibold text-[#262626]">
          {label}
        </label>
      )}
      <Component ref={ref} className={inputClass} {...rest} />
      {error && (
        <div className="text-[12px] text-red-500">{error}</div>
      )}
    </div>
  );
});

export default FormField;
