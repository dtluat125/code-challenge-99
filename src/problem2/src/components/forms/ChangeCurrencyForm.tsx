"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Container from "@/components/layout/Container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFetchCurrencyInformation } from "@/hooks/use-fetch-currency-information";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, Repeat } from "lucide-react";
import { useMemo, useState } from "react";
import { CurrencyItem } from "@/types";

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
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
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
                    <FormField
                      control={form.control}
                      name="inputCurrency"
                      render={({ field }) => (
                        <FormItem className="w-[80px]">
                          <FormLabel>From</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-[80px] justify-between",
                                    !field.value && "text-zinc-500"
                                  )}
                                >
                                  <span className="w-auto line-clamp-1">
                                    {field.value ? (
                                      <Avatar className="w-5 h-5">
                                        <AvatarImage
                                          src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${field.value.toUpperCase()}.svg`}
                                          alt={field.value}
                                        />
                                        <AvatarFallback>
                                          {field.value}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      ""
                                    )}
                                  </span>
                                  <ChevronsUpDown className="opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[150px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Search..."
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    {isFetchingCurrency ? (
                                      <Loader2 className="animate-spin" />
                                    ) : (
                                      "No currency found."
                                    )}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {uniqueCurrencyList?.map((item) => (
                                      <CommandItem
                                        value={item.currency}
                                        key={item.currency}
                                        onSelect={() => {
                                          field.onChange(item.currency);
                                          calculateOutputAmount({
                                            inputAmount:
                                              form.getValues("inputAmount"),
                                            inputCurrency: item.currency,
                                            outputCurrency:
                                              form.getValues("outputCurrency"),
                                          });
                                        }}
                                      >
                                        <div className="flex gap-2">
                                          <Avatar className="w-5 h-5">
                                            <AvatarImage
                                              src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${item.currency.toUpperCase()}.svg`}
                                              alt={item.currency}
                                            />
                                            <AvatarFallback>
                                              {item.currency}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="w-13 line-clamp-1 font-medium">
                                            {item.currency}
                                          </span>
                                        </div>
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            item.currency === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          <FormMessage />
                        </FormItem>
                      )}
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
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="outputCurrency"
                      render={({ field }) => (
                        <FormItem className="w-[80px]">
                          <FormLabel className="">To</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-[80px] justify-between",
                                    !field.value && "text-zinc-500"
                                  )}
                                >
                                  <span className="w-auto line-clamp-1">
                                    {field.value ? (
                                      <Avatar className="w-5 h-5">
                                        <AvatarImage
                                          src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${field.value.toUpperCase()}.svg`}
                                          alt={field.value}
                                        />
                                        <AvatarFallback>
                                          {field.value}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      ""
                                    )}
                                  </span>
                                  <ChevronsUpDown className="opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[150px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Search..."
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    No currency found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {uniqueCurrencyList?.map((item) => (
                                      <CommandItem
                                        value={item.currency}
                                        key={item.currency}
                                        onSelect={() => {
                                          field.onChange(item.currency);
                                          calculateInputAmount({
                                            outputAmount:
                                              form.getValues("outputAmount"),
                                            inputCurrency:
                                              form.getValues("inputCurrency"),
                                            outputCurrency: item.currency,
                                          });
                                        }}
                                      >
                                        <div className="flex gap-2">
                                          <Avatar className="w-5 h-5">
                                            <AvatarImage
                                              src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${item.currency.toUpperCase()}.svg`}
                                              alt={item.currency}
                                            />
                                            <AvatarFallback>
                                              {item.currency}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="w-13 line-clamp-1 font-medium">
                                            {item.currency}
                                          </span>
                                        </div>
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            item.currency === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          <FormMessage />
                        </FormItem>
                      )}
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
