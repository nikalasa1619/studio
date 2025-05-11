
"use client";

import React, { useState, useEffect } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NewsletterStyles } from "./types";
import { cn } from "@/lib/utils";
import { Ban, Square, Layers, ImageUp, Upload } from "lucide-react"; // Droplet replaced with Layers for gradient

interface BackdropCustomizerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialStyles: NewsletterStyles;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  children?: React.ReactNode;
}

const presetGradients = [
  { name: 'Serene Blue', start: '#a1c4fd', end: '#c2e9fb' },
  { name: 'Warm Sunset', start: '#ff9a9e', end: '#fecfef' },
  { name: 'Lush Green', start: '#84fab0', end: '#8fd3f4' },
  { name: 'Vibrant Pink', start: '#f6d365', end: '#fda085' },
  { name: 'Cool Sky', start: '#a8c0ff', end: '#3f2b96' },
  { name: 'Morning Dew', start: '#667eea', end: '#764ba2' },
  { name: 'Orange Juice', start: '#ff8c00', end: '#ffc107' },
  { name: 'Deep Purple', start: '#30cfd0', end: '#330867' },
  { name: 'Pastel Dream', start: '#fbc2eb', end: '#a6c1ee' },
  { name: 'Forest Mist', start: '#00c9ff', end: '#92fe9d' },
  { name: 'Desert Mirage', start: '#ffecd2', end: '#fcb69f' },
  { name: 'Nightfall', start: '#485563', end: '#29323c' },
];

export function BackdropCustomizer({
  isOpen,
  onOpenChange,
  initialStyles,
  onStylesChange,
  children,
}: BackdropCustomizerProps) {
  const [currentStyles, setCurrentStyles] = useState<NewsletterStyles>(initialStyles);
  const [activeTab, setActiveTab] = useState<NewsletterStyles['workspaceBackdropType']>(initialStyles.workspaceBackdropType || 'none');

  useEffect(() => {
    setCurrentStyles(initialStyles);
    setActiveTab(initialStyles.workspaceBackdropType || 'none');
  }, [initialStyles, isOpen]);

  const handleStyleChange = <K extends keyof NewsletterStyles>(
    field: K,
    value: NewsletterStyles[K]
  ) => {
    setCurrentStyles((prev) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (value: string) => {
    const newType = value as NewsletterStyles['workspaceBackdropType'];
    setActiveTab(newType);
    handleStyleChange('workspaceBackdropType', newType);
     // Set defaults when switching tabs
    if (newType === 'solid' && !currentStyles.workspaceBackdropSolidColor) {
      handleStyleChange('workspaceBackdropSolidColor', '#FFFFFF');
    } else if (newType === 'gradient') {
      if(!currentStyles.workspaceBackdropGradientStart) handleStyleChange('workspaceBackdropGradientStart', '#FFFFFF');
      if(!currentStyles.workspaceBackdropGradientEnd) handleStyleChange('workspaceBackdropGradientEnd', '#DDDDDD');
    } else if (newType === 'image' && !currentStyles.workspaceBackdropImageURL) {
        handleStyleChange('workspaceBackdropImageURL', `https://picsum.photos/seed/${Date.now()}/1200/800`);
    }
  };

  const handlePresetGradientClick = (gradient: { start: string; end: string }) => {
    setCurrentStyles((prev) => ({
      ...prev,
      workspaceBackdropType: 'gradient',
      workspaceBackdropGradientStart: gradient.start,
      workspaceBackdropGradientEnd: gradient.end,
    }));
    setActiveTab('gradient');
  };
  
  const handleImageUploadPlaceholder = () => {
    // For now, just set a random picsum photo
    const randomSeed = Math.random().toString(36).substring(7);
    handleStyleChange('workspaceBackdropImageURL', `https://picsum.photos/seed/${randomSeed}/1200/800`);
  };


  const handleApplyStyles = () => {
    onStylesChange(currentStyles);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Layers className="mr-2 h-4 w-4" /> Customize Backdrop
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[580px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Customize Workspace Backdrop</DialogTitle>
          <DialogDescription>
            Select a background type and customize its appearance.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="none" className="flex items-center gap-1.5"><Ban size={16}/>None</TabsTrigger>
            <TabsTrigger value="solid" className="flex items-center gap-1.5"><Square size={16}/>Solid</TabsTrigger>
            <TabsTrigger value="gradient" className="flex items-center gap-1.5"><Layers size={16}/>Gradient</TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-1.5"><ImageUp size={16}/>Image</TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[calc(70vh-120px)]">
            <div className="p-1 pr-4"> {/* Added padding for scrollbar */}
              {activeTab === 'solid' && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="workspaceBackdropSolidColor" className="text-right col-span-1">
                      Color
                    </Label>
                    <Input
                      id="workspaceBackdropSolidColor"
                      type="color"
                      value={currentStyles.workspaceBackdropSolidColor || '#FFFFFF'}
                      onChange={(e) => handleStyleChange('workspaceBackdropSolidColor', e.target.value)}
                      className="col-span-3 p-1 h-10"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'gradient' && (
                <div className="grid gap-6 py-4">
                   <div>
                    <Label className="block mb-3 text-sm font-medium">Preset Gradients</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {presetGradients.map((gradient, index) => (
                        <button
                          key={index}
                          title={gradient.name}
                          onClick={() => handlePresetGradientClick(gradient)}
                          className={cn(
                            "h-10 w-10 rounded-full border-2 transition-all",
                            currentStyles.workspaceBackdropGradientStart === gradient.start && currentStyles.workspaceBackdropGradientEnd === gradient.end
                              ? "border-primary ring-2 ring-primary ring-offset-2"
                              : "border-muted hover:border-foreground/50"
                          )}
                          style={{ backgroundImage: `linear-gradient(to bottom right, ${gradient.start}, ${gradient.end})` }}
                          aria-label={`Select ${gradient.name} preset`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <Label className="block mb-3 text-sm font-medium">Custom Gradient</Label>
                    <div className="grid grid-cols-4 items-center gap-4 mb-4">
                      <Label htmlFor="workspaceBackdropGradientStart" className="text-right col-span-1">
                        Start Color
                      </Label>
                      <Input
                        id="workspaceBackdropGradientStart"
                        type="color"
                        value={currentStyles.workspaceBackdropGradientStart || '#FFFFFF'}
                        onChange={(e) => handleStyleChange('workspaceBackdropGradientStart', e.target.value)}
                        className="col-span-3 p-1 h-10"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="workspaceBackdropGradientEnd" className="text-right col-span-1">
                        End Color
                      </Label>
                      <Input
                        id="workspaceBackdropGradientEnd"
                        type="color"
                        value={currentStyles.workspaceBackdropGradientEnd || '#DDDDDD'}
                        onChange={(e) => handleStyleChange('workspaceBackdropGradientEnd', e.target.value)}
                        className="col-span-3 p-1 h-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'image' && (
                <div className="grid gap-4 py-4 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed border-muted rounded-lg">
                    <ImageUp size={48} className="text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Image upload functionality is coming soon.</p>
                    <Button onClick={handleImageUploadPlaceholder} variant="outline">
                       <Upload size={16} className="mr-2"/> Load Placeholder Image
                    </Button>
                     {currentStyles.workspaceBackdropImageURL && (
                        <div className="mt-4">
                            <Label className="text-xs">Current Image URL (Picsum placeholder):</Label>
                            <Input 
                                type="text" 
                                value={currentStyles.workspaceBackdropImageURL}
                                onChange={(e) => handleStyleChange('workspaceBackdropImageURL', e.target.value)}
                                className="text-xs mt-1"
                                placeholder="Enter image URL"
                            />
                            <img data-ai-hint="abstract background" src={currentStyles.workspaceBackdropImageURL} alt="Backdrop preview" className="mt-2 rounded-md max-h-32 object-contain" />
                        </div>
                     )}
                  </div>
                </div>
              )}
              {activeTab === 'none' && (
                  <div className="py-10 text-center">
                    <Ban size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No backdrop selected. Workspace will use the default theme background.</p>
                  </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApplyStyles}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
