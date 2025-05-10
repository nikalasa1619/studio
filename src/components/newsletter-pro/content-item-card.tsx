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
  itemData, 
}: ContentItemCardProps) {
  
  // Helper to wrap string content for consistent styling
  const MainContentWrapper = ({ children }: { children: React.ReactNode }) => {
    if (typeof children === 'string' && children.trim() !== '') {
      return <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>;
    }
    return <>{children}</>; // Render ReactNode content as-is
  };

  return (
    <Card className={cn("overflow-hidden shadow-md transition-all hover:shadow-lg flex flex-col h-full", isSelected ? "ring-2 ring-primary" : "", className)}>
      <CardHeader className="p-4 border-b">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-grow">
            {title && <CardTitle className="text-lg font-semibold leading-tight">{title}</CardTitle>}
            {typeBadge && <Badge variant="secondary" className="mt-1.5 text-xs">{typeBadge}</Badge>}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 pt-1">
            <Checkbox
              id={`select-${id}`}
              checked={isSelected}
              onCheckedChange={(checked) => onToggleSelect(id, !!checked)}
              aria-label={`Select ${title || 'item'}`}
            />
            <Label htmlFor={`select-${id}`} className="text-sm font-medium cursor-pointer">Select</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <MainContentWrapper>{content}</MainContentWrapper>
      </CardContent>
    </Card>
  );
}
