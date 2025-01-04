import { CurrencyItem } from "@/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";

export const useFetchCurrencyInformation = (
  options?: Partial<UseQueryOptions>
) => {
  return useQuery({
    ...options,
    queryKey: ["fetch-currency-information"],
    queryFn: async () => {
      try {
        const response = await axios.get<CurrencyItem[]>(
          `https://interview.switcheo.com/prices.json`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching currency information:", error);
        throw new Error("Failed to fetch currency information");
      }
    },
  });
};
