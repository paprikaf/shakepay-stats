import React from 'react';
import classnames from 'classnames';
import styles from 'pages/Home.module.css';

const ToggleButton: React.FC<{
  title: string;
  description: string;
  input: string;
}> = ({ title, description, input }) => {
  const [show, setShow] = React.useState(false);
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleOutsideClick = (event: Event) => {
      if (
        ref !== null &&
        ref.contains(event.target as Node) === false
      ) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [show, ref]);

  return (
    <div className="relative">
      <button type="button" onClick={() => setShow(true)}>
        <div className="text-black-400 hover:text-gray-400">
          {title}
        </div>
        <div>{input}</div>
      </button>
      {show && (
        <div
          ref={setRef}
          className={classnames(
            'absolute w-50 bg-blue-200 p-4 rounded',
            styles.creditsTooltip
          )}
          style={{
            left: -10,
            bottom: 100,
          }}
        >
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export default ToggleButton;
