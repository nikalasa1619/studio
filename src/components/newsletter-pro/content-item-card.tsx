
"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ContentItemCardProps {
  id: string;
  title?: string; 
  content: string | React.ReactNode; 
  typeBadge?: string; 
  isSelected: boolean;
  onToggleSelect: (id: string, selected: boolean) => void;
  className?: string;
  itemData?: any; 
}

export function ContentItemCard({
  id,
  title,
  content,
  typeBadge,
  isSelected,
  onToggleSelect,
  className,
  itemData, // Kept for potential other uses, but authors will use pre-formatted content
}: ContentItemCardProps) {
  
  const renderMainContent = () => {
    // If content is a non-empty string, wrap it in a p tag
    if (typeof content === 'string' && content.trim() !== '') {
      return <p className="text-sm text-foreground/80">{content}</p>;
    }
    // Otherwise, assume content is already a ReactNode (e.g., for authors) or an empty string (for tools)
    return content;
  };

  return (
    <Card className={cn("overflow-hidden shadow-md transition-all hover:shadow-lg", isSelected ? "ring-2 ring-primary" : "", className)}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`select-${id}`}
              checked={isSelected}
              onCheckedChange={(checked) => onToggleSelect(id, !!checked)}
            />
            <Label htmlFor={`select-${id}`} className="text-sm">Select</Label>
          </div>
        </div>
        {typeBadge && <Badge variant="outline" className="mt-1">{typeBadge}</Badge>}
      </CardHeader>
      <CardContent className="p-4">
        {renderMainContent()}
      </CardContent>
    </Card>
  );
}
