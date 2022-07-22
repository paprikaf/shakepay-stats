import React from 'react';
import * as Csv from 'lib/Csv';
import ToggleButton from './toggleButton';

const dollarUSLocale = Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  currencyDisplay: 'code',
});
//TODO: Work on the UI for this component
const StatsDashBoardComponent: React.FC<Csv.Response> = (props) => {
  return (
    <div className="display: block grid justify-items-center">
      <div className="text-3xl hover:text-yellow-400 grid justify-items-center mb-10">
        {' '}
        STATS 💰
      </div>

      <div className="flex items-center ml-1">
        <div className="flex justify-center flex space-x-6">
          <ToggleButton
            title="Crypto Cashout 💎🙌"
            input={dollarUSLocale.format(props['crypto cashout'])}
            description="Sum of btc cashout."
          />
          <ToggleButton
            title="Crypto Funding 🧨"
            input={dollarUSLocale.format(props['crypto funding'])}
            description="Sum of btc funded using Blockchain."
          />
          <ToggleButton
            title="Fiat Cashout 💸"
            input={dollarUSLocale.format(props['fiat cashout'])}
            description="Sum of fiat cashout."
          />
          <ToggleButton
            title="Fiat Funding 🏦"
            input={dollarUSLocale.format(props['fiat funding'])}
            description="Sum of fiat funding."
          />
          <ToggleButton
            title="Peer Transfer 🔛"
            input={dollarUSLocale.format(props['peer transfer'])}
            description="Diffrence between amount debited/credited to other users on Shakepay."
          />
          <ToggleButton
            title="Purchase Or Sale 📈"
            input={dollarUSLocale.format(props['purchase/sale'])}
            description="Diffrence between amount debited/credited."
          />
          <ToggleButton
            title="Shakingsats 🤝"
            input={dollarUSLocale.format(props['shakingsats'])}
            description="Sum of btc funded using Blockchain."
          />
          <ToggleButton
            title="Card Transactions ☕"
            input={dollarUSLocale.format(props['card transactions'])}
            description="Sum of card transactions."
          />
          <ToggleButton
            title="Card Cashbacks 💰"
            input={dollarUSLocale.format(props['card cashbacks'])}
            description="Sum of card cashbacks."
          />
          <ToggleButton
            title="Referrals 🪤"
            input={dollarUSLocale.format(props['other'])}
            description="Sum of referrals (other)."
          />
        </div>
      </div>
    </div>
  );
};

export default StatsDashBoardComponent;
