"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import FormCurrencySelect from "@/components/forms/FormCurrencySelect";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFetchCurrencyInformation } from "@/hooks/use-fetch-currency-information";
import { toast } from "@/hooks/use-toast";
import { CurrencyItem } from "@/types";
import { Repeat } from "lucide-react";
import { useMemo, useState } from "react";

const FormSchema = z
  .object({
    inputAmount: z.number(),
    inputCurrency: z.string(),
    outputAmount: z.number(),
    outputCurrency: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.inputCurrency === data.outputCurrency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Input and output currency cannot be the same",
        path: ["outputCurrency"],
      });
    }
  });

export default function ChangeCurrencyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inputAmount: undefined,
      inputCurrency: "USD",
      outputAmount: undefined,
      outputCurrency: "ETH",
    },
    reValidateMode: "onChange",
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast({
      title: "Success",
      description: (
        <div>
          <div>
            <span className="font-medium">From:</span> {data.inputAmount}{" "}
            {data.inputCurrency}
          </div>
          <div>
            <span className="font-medium">To:</span> {data.outputAmount}{" "}
            {data.outputCurrency}
          </div>
        </div>
      ),
      variant: "success",
    });
  }

  const {
    data: currencyList = [],
    isLoading: isFetchingCurrency,
    // error,
  } = useFetchCurrencyInformation({
    throwOnError: (error) => {
      toast({
        title: "Error fetching currency information",
        description: error.message,
        variant: "destructive",
      });

      return false;
    },
  });

  const uniqueCurrencyList = useMemo(() => {
    const seen = new Set<string>();
    return (currencyList as CurrencyItem[])?.filter((item) => {
      if (seen.has(item.currency)) {
        return false;
      }
      seen.add(item.currency);
      return true;
    });
  }, [currencyList]);

  const exchangeRates = useMemo(() => {
    return uniqueCurrencyList.reduce((acc, item) => {
      acc[item.currency] = item.price;
      return acc;
    }, {} as Record<string, number>);
  }, [uniqueCurrencyList]);

  const handleSwap = () => {
    const inputCurrency = form.getValues("inputCurrency");
    const outputCurrency = form.getValues("outputCurrency");
    form.setValue("inputCurrency", outputCurrency);
    form.setValue("outputCurrency", inputCurrency);
    calculateOutputAmount({
      inputAmount: form.getValues("inputAmount"),
      inputCurrency: outputCurrency,
      outputCurrency: inputCurrency,
    });
  };

  const calculateOutputAmount = ({
    inputAmount,
    inputCurrency,
    outputCurrency,
  }: {
    inputAmount: number;
    inputCurrency: string;
    outputCurrency: string;
  }) => {
    if (
      inputAmount &&
      inputCurrency &&
      outputCurrency &&
      exchangeRates[inputCurrency] &&
      exchangeRates[outputCurrency]
    ) {
      const rate = exchangeRates[outputCurrency] / exchangeRates[inputCurrency];
      form.setValue(
        "outputAmount",
        parseFloat((inputAmount * rate).toFixed(2))
      );
      form.clearErrors("outputAmount");
    }
  };

  const calculateInputAmount = ({
    outputAmount,
    inputCurrency,
    outputCurrency,
  }: {
    outputAmount: number;
    inputCurrency: string;
    outputCurrency: string;
  }) => {
    if (
      outputAmount &&
      inputCurrency &&
      outputCurrency &&
      exchangeRates[inputCurrency] &&
      exchangeRates[outputCurrency]
    ) {
      const rate = exchangeRates[inputCurrency] / exchangeRates[outputCurrency];
      form.setValue(
        "inputAmount",
        parseFloat((outputAmount * rate).toFixed(2))
      );
      form.clearErrors("inputAmount");
    }
  };

  return (
    <Container>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm ">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Swap</CardTitle>
              <CardDescription>
                Swap from one currency to another
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-6"
                >
                  <div className="flex gap-2">
                    <FormCurrencySelect
                      control={form.control}
                      name="inputCurrency"
                      currencyList={uniqueCurrencyList}
                      onchange={(currency) => {
                        calculateOutputAmount({
                          inputAmount: form.getValues("inputAmount"),
                          inputCurrency: currency,
                          outputCurrency: form.getValues("outputCurrency"),
                        });
                      }}
                      isLoading={isFetchingCurrency}
                      label="From"
                    />
                    <FormField
                      control={form.control}
                      name="inputAmount"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>&nbsp;</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the amount to send"
                              {...field}
                              onChange={(e) => {
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                );
                                calculateOutputAmount({
                                  inputAmount: parseFloat(e.target.value),
                                  inputCurrency:
                                    form.getValues("inputCurrency"),
                                  outputCurrency:
                                    form.getValues("outputCurrency"),
                                });
                              }}
                              type="number"
                              step="any"
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <FormCurrencySelect
                      control={form.control}
                      name="outputCurrency"
                      currencyList={uniqueCurrencyList}
                      onchange={(currency) => {
                        calculateInputAmount({
                          outputAmount: form.getValues("outputAmount"),
                          inputCurrency: form.getValues("inputCurrency"),
                          outputCurrency: currency,
                        });
                      }}
                      isLoading={isFetchingCurrency}
                      label="To"
                    />
                    <FormField
                      control={form.control}
                      name="outputAmount"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>&nbsp;</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the amount to receive"
                              {...field}
                              onChange={(e) => {
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                );
                                calculateInputAmount({
                                  outputAmount: parseFloat(e.target.value),
                                  inputCurrency:
                                    form.getValues("inputCurrency"),
                                  outputCurrency:
                                    form.getValues("outputCurrency"),
                                });
                              }}
                              type="number"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSwap}
                    className="flex items-center gap-2"
                    disabled={
                      !form.getValues("inputCurrency") ||
                      !form.getValues("outputCurrency") ||
                      isSubmitting
                    }
                  >
                    <Repeat className="w-5 h-5" /> Swap Currencies
                  </Button>

                  <Button loading={isSubmitting} type="submit">
                    Submit
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
