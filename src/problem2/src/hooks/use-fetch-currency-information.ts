import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useFetchCurrencyInformation = (userId: string) => {
  return useQuery({
    queryKey: ["fetch-currency-information", userId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/user/${userId}/communication-preferences`
      );
      return response.data;
    },
  });
};
