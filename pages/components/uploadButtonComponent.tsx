import React from 'react';

const UploadButtonComponent: React.FC<{
  onClick: MouseEvent<HTMLButtonElement>;
}> = (onClick) => {
  return (
    <button
      type="button"
      className="p-2 -m-2 absolute top-0 right-2 text-2xl"
      onClick={() => onClick}
    >
      &times;
    </button>
  );
};
