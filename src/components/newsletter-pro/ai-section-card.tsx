
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
  sharedTopic?: string; 
  topicFieldName?: keyof TFormValues; 
  action: (data: TFormValues) => Promise<TResponseData>;
  onDataReceived: (data: TResponseData) => void;
  ctaText?: string;
  isDisabled?: boolean; // New prop to control button disable state externally
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
  isDisabled = false, // Default to false
}: AiSectionCardProps<TFormValues, TResponseData>) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((acc, field) => {
      acc[field.name] = field.type === 'textarea' ? '' : (field.type === 'number' ? undefined : '');
      return acc;
    }, {} as TFormValues),
  });
  
  useEffect(() => {
    if (topicFieldName) {
      const topicValueToSet = sharedTopic !== undefined ? sharedTopic : (formSchema.shape[topicFieldName]?.description?.includes('number') ? undefined : '');
      form.setValue(topicFieldName as any, topicValueToSet as any, { shouldValidate: true, shouldDirty: true });
    }
  }, [sharedTopic, topicFieldName, form.setValue, formSchema]);


  const onSubmit: SubmitHandler<TFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const payload = {...data}; // Create a copy to avoid mutating the original form data
      
      if (topicFieldName && sharedTopic !== undefined) {
        payload[topicFieldName] = sharedTopic as any;
      }
      
      const result = await action(payload);
      onDataReceived(result); // This might be redundant if callAiAction handles it
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
  
  const isTopicFieldExplicitlyInFormFields = !!(topicFieldName && formFields.find(f => f.name === topicFieldName));

  // The button's disabled state is now primarily controlled by the `isDisabled` prop, 
  // but also considers its internal loading state and form validity.
  const finalIsDisabled = isDisabled || isLoading || !form.formState.isValid;


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
              // This condition might need adjustment if topic field is always hidden but still part of schema
              (topicFieldName === field.name && sharedTopic !== undefined && !isTopicFieldExplicitlyInFormFields) ? null : (
                <FormField
                  key={String(field.name)}
                  control={form.control}
                  name={field.name as any}
                  render={({ field: formFieldRender }) => (
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
            
            {/* This Controller is for validating the topic field when it's not explicitly rendered */}
            {topicFieldName && sharedTopic !== undefined && !isTopicFieldExplicitlyInFormFields && (
              <Controller
                name={topicFieldName as any}
                control={form.control}
                defaultValue={sharedTopic as any} // Ensure default value is set for validation
                render={({ fieldState }) => (
                   <FormItem className={fieldState.error ? "" : "hidden"}> {/* Show message only if there's an error */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={finalIsDisabled} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ctaText}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
