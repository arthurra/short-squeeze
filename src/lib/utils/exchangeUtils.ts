export type USExchange = "NYSE" | "NASDAQ" | "AMEX" | "OTC";

export const US_EXCHANGES: USExchange[] = ["NYSE", "NASDAQ", "AMEX", "OTC"];

export function getExchangeFromSymbol(symbol: string): USExchange {
  // TODO: Implement proper exchange detection logic
  // For now, return a default exchange
  return "NASDAQ";
}

export interface ExchangeInfo {
  id: USExchange;
  name: string;
}

export function isValidUSExchange(exchange: string): exchange is USExchange {
  return US_EXCHANGES.some((e) => e === exchange);
}

export function getExchangeName(exchange: USExchange): string {
  // This is a simplified implementation. In a real application,
  // you would need to maintain a mapping of exchanges to names
  // or fetch this information from an API.

  // For now, we'll use a switch statement to return the name
  switch (exchange) {
    case "NYSE":
      return "New York Stock Exchange";
    case "NASDAQ":
      return "NASDAQ";
    case "AMEX":
      return "American Stock Exchange";
    case "OTC":
      return "Over The Counter";
    default:
      return exchange;
  }
}
