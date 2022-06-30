import React from 'react';

const dollarUSLocale = Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  currencyDisplay: 'code',
});

const BtcPriceComponent: React.FC<{ price: number }> = ({
  price,
}) => {
  return (
    <div className="inline-block">
      <div className="flex flex-wrap justify-center ">
        <div className="text-2xl hover:text-orange-400">
          {dollarUSLocale.format(price)}
        </div>
        <img className="w-5 h-5" src="/btc.svg" alt="BitcoinLogo" />
      </div>
    </div>
  );
};

export default BtcPriceComponent;
