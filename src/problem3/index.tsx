interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: any; // Fix: Add type for `blockchain`
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0; // Simplified logic
      })
      .sort((leftBalance: WalletBalance, rightBalance: WalletBalance) => {
        const leftPriority = getPriority(leftBalance.blockchain);
        const rightPriority = getPriority(rightBalance.blockchain);
        return rightPriority - leftPriority; // Simplified comparison
      });
  }, [balances]); // Removed unnecessary `prices` dependency

  // Combined `formattedBalances` logic into `rows` creation
  const rows = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={balance.currency} // Replaced `index` with a unique key - Suppose that Currency is unique
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.amount.toFixed()} // Formatting done here
        />
      );
    });
  }, [sortedBalances, prices]); // Memoized to avoid unnecessary re-renders

  return <div {...rest}>{rows}</div>;
};
