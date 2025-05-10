
"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Added cn import
import type { Quote } from "./types";

interface ContentItemCardProps {
  id: string;
  title?: string; // For author name, tool name, etc.
  content: string | React.ReactNode; // For quote text, fact text, tool description, aggregated text
  typeBadge?: string; // e.g., "Quote", "Fun Fact", "Free Tool"
  isSelected: boolean;
  onToggleSelect: (id: string, selected: boolean) => void;
  className?: string;
  itemData?: any; // Raw item data, useful for complex rendering
}

export function ContentItemCard({
  id,
  title,
  content,
  typeBadge,
  isSelected,
  onToggleSelect,
  className,
  itemData,
}: ContentItemCardProps) {
  
  const renderContent = () => {
    if (itemData && itemData.type === 'author') {
      // Custom rendering for authors and their quotes
      return (
        <div className="space-y-2">
          {itemData.quotes.map((quote: Quote) => (
            <div key={quote.id} className="flex items-start space-x-2 p-2 border rounded-md bg-secondary/30">
              <Checkbox
                id={quote.id}
                checked={quote.selected}
                onCheckedChange={(checked) => onToggleSelect(quote.id, !!checked)}
                className="mt-1"
              />
              <Label htmlFor={quote.id} className="text-sm font-normal leading-snug">
                "{quote.text}"
              </Label>
            </div>
          ))}
        </div>
      );
    }
    // Default rendering for simple content
    return <p className="text-sm text-foreground/80">{content}</p>;
  };


  return (
    <Card className={cn("overflow-hidden shadow-md transition-all hover:shadow-lg", isSelected ? "ring-2 ring-primary" : "", className)}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {/* Standard checkbox for non-author items or if title is the main selectable entity */}
          {!(itemData && itemData.type === 'author') && (
             <div className="flex items-center space-x-2">
              <Checkbox
                id={`select-${id}`}
                checked={isSelected}
                onCheckedChange={(checked) => onToggleSelect(id, !!checked)}
              />
              <Label htmlFor={`select-${id}`} className="text-sm">Select</Label>
            </div>
          )}
        </div>
        {typeBadge && <Badge variant="outline" className="mt-1">{typeBadge}</Badge>}
      </CardHeader>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}

