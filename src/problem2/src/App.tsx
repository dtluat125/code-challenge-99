import ChangeCurrencyForm from "@/components/forms/ChangeCurrencyForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChangeCurrencyForm />
    </QueryClientProvider>
  );
}

export default App;
