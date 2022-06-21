import React from 'react';
import classnames from 'classnames';
import styles from 'pages/Home.module.css';

const Credits: React.FC = () => {
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
      <button
        type="button"
        className="underline text-gray-400 mt-4 text-sm"
        onClick={() => setShow(true)}
      >
        Learn how your data is being handled
      </button>
      {show && (
        <div
          ref={setRef}
          className={classnames(
            'absolute w-64 bg-blue-200 p-4 rounded',
            styles.creditsTooltip
          )}
          style={{
            left: -10,
            bottom: 30,
          }}
        >
          <p>
            Your CSV file is processed on our server but we do not
            store it. We simply use the data to compute the stats
            we're showing you.{' '}
            <span className="underline">Nothing is persisted.</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Credits;
