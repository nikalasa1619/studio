"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NewsletterStyles } from "./types";
import { Palette } from "lucide-react";

const availableFonts = [
  "Inter, sans-serif",
  "Arial, sans-serif",
  "Verdana, sans-serif",
  "Georgia, serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Roboto, sans-serif",
  "Lato, sans-serif",
  "Montserrat, sans-serif",
  "Open Sans, sans-serif",
];

interface StyleCustomizerProps {
  initialStyles: NewsletterStyles;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  children?: React.ReactNode; // To allow custom trigger
}

export function StyleCustomizer({ initialStyles, onStylesChange, children }: StyleCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [styles, setStyles] = useState<NewsletterStyles>(initialStyles);

  useEffect(() => {
    setStyles(initialStyles);
  }, [initialStyles]);

  const handleChange = (field: keyof NewsletterStyles, value: string) => {
    setStyles((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyStyles = () => {
    onStylesChange(styles);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Palette className="mr-2 h-4 w-4" /> Customize Styles
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Customize Newsletter Styles</DialogTitle>
          <DialogDescription>
            Adjust fonts and colors for your newsletter content. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {[
            { label: "Heading Font", field: "headingFont", type: "font" },
            { label: "Paragraph Font", field: "paragraphFont", type: "font" },
            { label: "Hyperlink Font", field: "hyperlinkFont", type: "font" },
            { label: "Heading Color", field: "headingColor", type: "color" },
            { label: "Paragraph Color", field: "paragraphColor", type: "color" },
            { label: "Hyperlink Color", field: "hyperlinkColor", type: "color" },
            { label: "Background Color", field: "backgroundColor", type: "color" },
          ].map(({ label, field, type }) => (
            <div className="grid grid-cols-4 items-center gap-4" key={field}>
              <Label htmlFor={field} className="text-right col-span-1">
                {label}
              </Label>
              {type === "font" ? (
                <Select
                  value={styles[field as keyof NewsletterStyles]}
                  onValueChange={(value) => handleChange(field as keyof NewsletterStyles, value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFonts.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font.split(',')[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field}
                  type="color"
                  value={styles[field as keyof NewsletterStyles]}
                  onChange={(e) => handleChange(field as keyof NewsletterStyles, e.target.value)}
                  className="col-span-3 p-1 h-10"
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleApplyStyles}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
