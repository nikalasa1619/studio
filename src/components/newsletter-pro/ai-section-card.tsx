"use client";

import type React from "react";
import { useState, type ReactNode, useEffect } from "react";
import { useForm, type SubmitHandler, FormProvider, Controller } from "react-hook-form";
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
      acc[field.name] = field.type === 'textarea' ? '' : ''; 
      return acc;
    }, {} as TFormValues),
  });

  useEffect(() => {
    if (sharedTopic !== undefined && topicFieldName) {
      form.setValue(topicFieldName as any, sharedTopic as any, { shouldValidate: true });
    }
  }, [sharedTopic, topicFieldName, form.setValue]);

  const onSubmit: SubmitHandler<TFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // Payload is already validated by react-hook-form's handleSubmit
      // If sharedTopic was used, it's already in `data` via form.setValue in useEffect
      const payload = data;
      
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
  
  // Determine if the topic field (if specified by topicFieldName) is part of the visible formFields configuration.
  const isTopicFieldExplicitlyInFormFields = !!(topicFieldName && formFields.find(f => f.name === topicFieldName));


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
              // Hide field if it's the designated topicFieldName and sharedTopic is active
              (topicFieldName === field.name && sharedTopic !== undefined) ? null : (
                <FormField
                  key={String(field.name)}
                  control={form.control}
                  name={field.name as any}
                  render={({ field: formFieldRender }) => ( // Renamed to avoid conflict
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        {field.type === "textarea" ? (
                          <Textarea placeholder={field.placeholder} {...formFieldRender} rows={3} />
                        ) : (
                          <Input type={field.type} placeholder={field.placeholder} {...formFieldRender} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            ))}
            
            {/* Display FormMessage for topicFieldName if it's managed by sharedTopic and NOT explicitly in formFields */}
            {/* This ensures validation messages for the shared topic (like 'topic is too short') are shown */}
            {topicFieldName && sharedTopic !== undefined && !isTopicFieldExplicitlyInFormFields && (
              <Controller
                name={topicFieldName as any}
                control={form.control}
                render={() => ( // field prop from render is not used here
                  <FormItem>
                    {/* Label and Control are omitted as there's no visible input for this implicit field */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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

