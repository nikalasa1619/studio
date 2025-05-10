"use client";

import type React from "react";
import { useState, type ReactNode } from "react";
import { useForm, type SubmitHandler, type UseFormReturn, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType, ZodTypeDef } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AiSectionCardProps<TFormValues extends Record<string, any>, TResponseData> {
  title: string;
  description: string;
  icon: ReactNode;
  formSchema: ZodType<TFormValues, ZodTypeDef, TFormValues>;
  formFields: Array<{
    name: keyof TFormValues;
    label: string;
    placeholder?: string;
    type: "text" | "textarea" | "number";
    required?: boolean;
  }>;
  sharedTopic?: string; // For sections that use a global topic
  topicFieldName?: keyof TFormValues; // Name of the topic field in this specific form, if it overrides global
  action: (data: TFormValues) => Promise<TResponseData>;
  onDataReceived: (data: TResponseData) => void;
  ctaText?: string;
}

export function AiSectionCard<TFormValues extends Record<string, any>, TResponseData>({
  title,
  description,
  icon,
  formSchema,
  formFields,
  sharedTopic,
  topicFieldName,
  action,
  onDataReceived,
  ctaText = "Generate",
}: AiSectionCardProps<TFormValues, TResponseData>) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((acc, field) => {
      acc[field.name] = field.type === 'textarea' ? '' : ''; // Initialize all fields, handle specific defaults if needed
      return acc;
    }, {} as TFormValues),
  });

  const onSubmit: SubmitHandler<TFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // If there's a shared topic and a topic field name for this form, inject it
      const payload = { ...data };
      if (sharedTopic && topicFieldName && !(topicFieldName in data && data[topicFieldName])) {
         (payload as any)[topicFieldName] = sharedTopic;
      }
      
      // Check if topic is still missing after potential injection
      if (topicFieldName && !payload[topicFieldName]) {
        form.setError(topicFieldName as any, { type: "manual", message: "Topic is required." });
        setIsLoading(false);
        return;
      }
      
      const result = await action(payload);
      onDataReceived(result);
      toast({
        title: `${title} generated!`,
        description: "Content has been successfully fetched.",
      });
    } catch (error) {
      console.error(`Error generating ${title}:`, error);
      toast({
        title: `Error generating ${title}`,
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-primary">{icon}</span>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {formFields.map((field) => (
              // Hide topic field if sharedTopic is provided and this is the designated topic field
              (topicFieldName === field.name && sharedTopic) ? null : (
                <FormField
                  key={String(field.name)}
                  control={form.control}
                  name={field.name as any}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        {field.type === "textarea" ? (
                          <Textarea placeholder={field.placeholder} {...formField} rows={3} />
                        ) : (
                          <Input type={field.type} placeholder={field.placeholder} {...formField} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            ))}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ctaText}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
