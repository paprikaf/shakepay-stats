import React from 'react';

const HeaderComponent: React.FC = () => {
  return (
    <header>
      <h1 className="text-4xl mb-2">
        Learn what your BTC is worth on Shakepay
      </h1>
      <p>
        {/* TODO explain to go get the history in shakepay */}
        Upload your shakepay{' '}
        <a href="" className="underline">
          transactions history
        </a>{' '}
        and discover how much you gained or lost over time 💰.
      </p>
    </header>
  );
};

export default HeaderComponent;
