"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Container from "@/components/layout/Container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FormSchema = z.object({
  inputAmount: z.number(),
});

export default function ChangeCurrencyForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inputAmount: undefined,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

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
                  <FormField
                    control={form.control}
                    name="inputAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount to send</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter the amount to send"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The amount you want to swap
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inputAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount to receive</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter the amount to receive"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>The amount you want</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
