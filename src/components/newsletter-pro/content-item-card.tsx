"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, PlusCircle, ExternalLink } from "lucide-react"; 


interface ContentItemCardProps {
  id: string;
  title?: string; 
  content: string | React.ReactNode; 
  typeBadge?: string; 
  isImported: boolean; 
  onToggleImport: (id: string, imported: boolean) => void; 
  className?: string;
  itemData?: any; 
  amazonLink?: string;
  relevanceScore?: number; 
  // Newsletter specific props
  newsletterOperator?: string;
  newsletterDescription?: string;
  newsletterSubscribers?: string;
  signUpLink?: string;
}

const getRelevanceBadgeClass = (score: number): string => {
  if (score >= 80) return "bg-chart-2 text-primary-foreground"; 
  if (score >= 60) return "bg-chart-4 text-foreground"; 
  if (score >= 40) return "bg-chart-5 text-foreground"; 
  return "bg-destructive text-destructive-foreground"; 
};


export function ContentItemCard({
  id,
  title,
  content,
  typeBadge,
  isImported,
  onToggleImport,
  className,
  itemData, 
  amazonLink,
  relevanceScore,
  newsletterOperator,
  newsletterDescription,
  newsletterSubscribers,
  signUpLink,
}: ContentItemCardProps) {
  
  const MainContentWrapper = ({ children }: { children: React.ReactNode }) => {
    if (typeof children === 'string' && children.trim() !== '') {
      return <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>;
    }
    return <>{children}</>;
  };

  const shouldShowRelevanceBadge = (typeBadge === "Author" || 
                                   typeBadge === "Fun Fact" || 
                                   typeBadge === "Science Fact" ||
                                   typeBadge === "Free Tool" ||
                                   typeBadge === "Paid Tool" ||
                                   typeBadge === "Newsletter") // Added Newsletter
                                   && relevanceScore !== undefined;

  const getButtonText = (baseText: "Import" | "Select" | "Selected" | "Imported") => {
    if (typeBadge === "Author") return baseText === "Select" || baseText === "Selected" ? (isImported ? "Imported" : "Import") : baseText;
    if (typeBadge === "Newsletter") return baseText === "Select" || baseText === "Selected" ? (isImported ? "Selected" : "Select") : baseText;
    return isImported ? "Selected" : "Select";
  }
  
  return (
    <Card className={cn("overflow-hidden shadow-md transition-all hover:shadow-lg flex flex-col h-full", isImported ? "ring-2 ring-primary" : "", className)}>
      <CardHeader className="p-4 border-b">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-grow">
            {title && <CardTitle className="text-lg font-semibold leading-tight">{title}</CardTitle>}
            {typeBadge && (
              <Badge variant="secondary" className="mt-1.5 text-xs">
                {typeBadge}
              </Badge>
            )}
          </div>
          {shouldShowRelevanceBadge && (
            <Badge
              variant="outline" 
              className={cn(
                "ml-auto text-xs font-semibold", 
                getRelevanceBadgeClass(relevanceScore!) 
              )}
            >
              {relevanceScore!.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <MainContentWrapper>{content}</MainContentWrapper>
        {typeBadge === "Newsletter" && (
          <div className="mt-2 space-y-1">
            {newsletterOperator && <p className="text-xs text-muted-foreground">By: {newsletterOperator}</p>}
            {newsletterDescription && <p className="text-sm text-foreground/90 leading-snug mt-1">{newsletterDescription}</p>}
            {newsletterSubscribers && <p className="text-xs text-muted-foreground mt-1">Subscribers: {newsletterSubscribers}</p>}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-2 border-t mt-auto flex flex-col space-y-2">
        {amazonLink && typeBadge === "Author" && (
          <Button asChild variant="outline" className="w-full">
            <a href={amazonLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.253 12.174c-.063.03-.122.038-.18.038H0c.074.05.14.12.193.204l.193.294c.053.084.107.176.16.274.329.62.737 1.173 1.238 1.64C2.47 15.44 3.424 16 4.64 16c1.44 0 2.609-.704 3.27-1.994.222-.425.41-.927.546-1.493.137-.566.206-1.182.206-1.852 0-.67-.07-1.286-.207-1.852-.136-.566-.324-1.068-.546-1.493C7.249.704 6.08 0 4.64 0 2.014 0 0 2.25 0 4.728a4.65 4.65 0 0 0 .073.858c.02.19.046.37.078.536.026.137.057.27.09.395l.09.395c.024.1.047.193.068.274.023.088.042.17.057.243.017.08.03.153.038.22.008.067.012.13.012.185 0 .056-.004.12-.012.185-.008.067-.02.14-.038.22a1.7 1.7 0 0 1-.057.243c-.02.08-.043.175-.068.274l-.09.395a4.8 4.8 0 0 0-.09.395c-.032.166-.058.346-.078.536A4.65 4.65 0 0 0 0 9.272c0 2.478 2.014 4.728 4.64 4.728.952 0 1.71-.24 2.29-.738.29-.248.537-.536.737-.862.2-.325.362-.677.488-1.05H4.75c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h2.836c.106-.75.106-1.023.106-1.728s0-.978-.106-1.728H4.75c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h2.836c-.126-.373-.288-.725-.488-1.05-.2-.326-.447-.614-.737-.862C6.35.24 5.592 0 4.64 0 .856 0 .253 1.214.253 2.62V3c0 .414.336.75.75.75h1.75a.75.75 0 0 0 .75-.75V2.75c0-.67.08-.897.08-1.147 0-.253.063-.45.18-.596A.74.74 0 0 1 4.136.88c.166 0 .3.057.393.14.093.084.14.193.14.329s-.047.245-.14.328a.5.5 0 0 1-.393.14H2.75c-.414 0-.75.336-.75.75v7.5c0 .414.336.75.75.75h1.386c.056.18.12.347.18.506.064.16.13.31.18.453.05.145.087.28.112.405.025.125.037.24.037.346s-.012.22-.037.346a2.4 2.4 0 0 1-.112.405c-.05.143-.116.3-.18.458-.06.156-.125.328-.18.505H2.75a.75.75 0 0 0-.75.75v.376c0 .14-.047.254-.14.329a.5.5 0 0 1-.393.14.49.49 0 0 1-.393-.14.74.74 0 0 1-.14-.33zm4.113-4.195c-.112-.063-.233-.12-.363-.17-.13-.05-.268-.09-.413-.12-.145-.03-.296-.045-.45-.045-.154 0-.305.015-.45.045-.145.03-.283.07-.413.12-.13.05-.25.107-.363.17-.112.063-.212.12-.3.17-.09.05-.163.09-.22.12-.058.03-.098.05-.12.06q-.024.015-.024.015c0 .09.063.15.18.17.118.02.25.03.394.03.144 0 .273-.01.393-.03.12-.02.213-.05.274-.09.063-.04.094-.08.094-.12 0-.04-.03-.07-.094-.1-.063-.027-.148-.04-.256-.04-.11 0-.206.013-.287.04a.49.49 0 0 0-.22.15c-.047.067-.07.14-.07.22s.023.153.07.22c.047.067.112.12.193.158a.7.7 0 0 0 .245.09c.09.02.18.03.274.03.17 0 .312-.022.432-.068a.6.6 0 0 0 .28-.22c.068-.1.102-.212.102-.338a.5.5 0 0 0-.078-.274.5.5 0 0 0-.22-.18c-.09-.047-.2-.07-.328-.07-.127 0-.237.023-.328.07-.137.072-.206.166-.206.283 0 .062.026.12.078.17.052.05.12.085.206.107.087.022.19.033.306.033.117 0 .22-.01.313-.033.094-.022.172-.057.237-.102.062-.046.11-.102.14-.165.032-.063.047-.13.047-.202s-.015-.14-.047-.202a.48.48 0 0 0-.14-.165c-.065-.045-.143-.08-.237-.102a.7.7 0 0 0-.313-.033c-.116 0-.217.01-.305.033-.09.022-.163.057-.22.102-.058.045-.098.102-.12.165l-.023.094c0 .062.015.116.047.164.03.048.078.085.14.11.062.028.136.042.22.042.087 0 .16-.014.22-.042.063-.025.11-.062.14-.11.032-.047.047-.102.047-.164l.024-.084c.015-.063.022-.12.022-.17s-.007-.094-.022-.13a.17.17 0 0 0-.054-.085.18.18 0 0 0-.086-.05c-.04-.015-.087-.022-.14-.022h-.11c-.052 0-.098.007-.136.022a.17.17 0 0 0-.094.06c-.025.03-.04.06-.04.09v.01c0 .03.015.05.042.06.027.01.062.015.102.015h.1c.04 0 .074-.005.1-.015.027-.01.047-.02.06-.03.013-.01.02-.015.02-.015.023-.02.042-.04.057-.068.015-.027.022-.057.022-.09 0-.032-.007-.062-.022-.09a.2.2 0 0 0-.057-.068.18.18 0 0 0-.086-.042.2.2 0 0 0-.11-.015c-.052 0-.098.005-.136.015a.17.17 0 0 0-.094.042.14.14 0 0 0-.054.068.1.1 0 0 0-.022.09v.008l.007.022c.004.01.01.02.015.022l.015.015c.007.008.022.015.045.022.023.008.05.012.08.012.032 0 .06-.004.08-.012.023-.007.038-.014.046-.022l.015-.015.015-.022.007-.022q0-.008-.007-.022a.2.2 0 0 0-.054-.086.18.18 0 0 0-.086-.05c-.04-.015-.087-.022-.14-.022h-.11a.24.24 0 0 0-.136.022.17.17 0 0 0-.094.06.14.14 0 0 0-.04.09v.008l.042.06c.027.01.062.015.102.015h.1c.04 0 .074-.005.1-.015.027-.01.047-.02.06-.03zm2.863 4.152h.75V.75h-.75zm1.5 0h.75V.75h-.75zM8.75 12V9.75h.75V12zm0-3V6.75h.75V9zm0-3V4.5h.75V6zm0-2.25V1.5h.75v2.25z"/>
                <path d="M15.525 7.955c.242.25.18.83-.204 1.343-.385.513-.847.817-1.18.91-.204.058-.383.083-.524.083-.18 0-.387-.03-.574-.09-.188-.06-.33-.14-.428-.24s-.14-.22-.14-.36c0-.14.046-.26.14-.36.098-.1.24-.18.427-.24.188-.06.376-.09.574-.09.14 0 .28.025.393.074.112.05.212.12.3.2l.22.21c.087.09.13.19.13.3 0 .07-.017.13-.053.18-.035.05-.087.08-.152.08-.066 0-.12-.02-.16-.06a.3.3 0 0 1-.08-.15l-.01-.03c-.01-.02-.02-.03-.03-.03-.01 0-.02.01-.03.03l-.11.15c-.04.05-.08.09-.13.11a.25.25 0 0 1-.14.03c-.07 0-.13-.01-.17-.04a.18.18 0 0 1-.1-.11c-.02-.05-.03-.1-.03-.16s.01-.11.03-.16c.02-.05.05-.09.1-.11s.1-.04.17-.04c.06 0 .1.01.14.03.04.02.07.05.1.08l.06.09.03.05c.01.02.02.03.03.03.01 0 .02-.01.03-.03l.18-.24a.65.65 0 0 0 .18-.37c0-.14-.04-.26-.12-.36-.08-.1-.18-.17-.3-.22-.12-.05-.25-.07-.4-.07-.19 0-.37.04-.53.11-.16.07-.29.17-.39.29s-.17.26-.17.42c0 .13.03.24.09.33s.15.16.26.21c.11.05.24.08.39.08.2 0 .38-.03.53-.09.15-.06.26-.13.34-.22l.09-.12.03-.05.01-.02v-.01a.7.7 0 0 0-.42-.62z"/>
              </svg>
              Review on Amazon
            </a>
          </Button>
        )}
        {signUpLink && typeBadge === "Newsletter" && (
          <Button asChild variant="outline" className="w-full">
            <a href={signUpLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              <ExternalLink size={16} /> Sign Up
            </a>
          </Button>
        )}
        {itemData && (itemData.hasOwnProperty('selected') || itemData.hasOwnProperty('imported') ) && ( 
           <Button 
            variant={isImported ? "secondary" : "default"} 
            className="w-full" 
            onClick={() => onToggleImport(id, !isImported)}
          >
            {isImported ? <CheckCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {getButtonText(isImported ? (typeBadge === "Author" ? "Imported" : "Selected") : (typeBadge === "Author" ? "Import" : "Select"))}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
