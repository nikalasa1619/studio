
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Filter, ArrowUpDown, ChevronDown } from "lucide-react";
import type { ContentType, SortOption, AuthorSortOption, WorkspaceView } from "../types";
import { COMMON_FREQUENCIES } from "../types";
import { nameSortOptions, textSortOptions, commonSortOptions } from "../utils/workspace-helpers"; 
import { cn } from '@/lib/utils';

interface ContentFiltersBarProps {
    activeUITab: ContentType;
    filterStates: Record<ContentType, string>;
    sortStates: Record<ContentType, SortOption['value'] | AuthorSortOption>;
    onFilterChange: (type: ContentType, value: string) => void;
    onSortChange: (type: ContentType, value: SortOption['value'] | AuthorSortOption) => void;
    showOnlySelected: Record<ContentType, boolean>;
    onShowOnlySelectedChange: (type: ContentType, checked: boolean) => void;
    currentContentDisplayView: WorkspaceView;
    uniqueAuthorNamesForFilter: string[];
}

export function ContentFiltersBar({
    activeUITab,
    filterStates,
    sortStates,
    onFilterChange,
    onSortChange,
    showOnlySelected,
    onShowOnlySelectedChange,
    currentContentDisplayView,
    uniqueAuthorNamesForFilter,
}: ContentFiltersBarProps) {
    const currentFilter = filterStates[activeUITab];
    const currentSort = sortStates[activeUITab];

    const FilterButtonWithTooltip = ({ children, tooltipText, shortcutHint }: { children: React.ReactNode, tooltipText: string, shortcutHint?: string }) => (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent className="tooltip-orb" side="top" align="center">
                {tooltipText} {shortcutHint && <span className="ml-1 text-xs opacity-70">({shortcutHint})</span>}
            </TooltipContent>
        </Tooltip>
    );


    const renderFilters = () => {
        switch (activeUITab) {
            case 'authors':
                return (
                    <>
                        <FilterButtonWithTooltip tooltipText="Filter by Author" shortcutHint="Alt+A">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between py-2 sm:py-2.5"><Filter className="mr-2 h-4 w-4" />{currentFilter === "all" ? "All Authors" : currentFilter}<ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent className="z-50">
                                    <DropdownMenuCheckboxItem checked={currentFilter === "all"} onCheckedChange={() => onFilterChange('authors', "all")} onSelect={(e) => e.preventDefault()}>All Authors</DropdownMenuCheckboxItem>
                                    <DropdownMenuSeparator />
                                    {uniqueAuthorNamesForFilter.map(name => (<DropdownMenuCheckboxItem key={name} checked={currentFilter === name} onCheckedChange={() => onFilterChange('authors', name)} onSelect={(e) => e.preventDefault()}>{name}</DropdownMenuCheckboxItem>))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                        <FilterButtonWithTooltip tooltipText="Sort Authors" shortcutHint="Alt+S">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between py-2 sm:py-2.5"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="z-50">{[{ value: "relevance_desc", label: "Relevance (High-Low)" },{ value: "relevance_asc", label: "Relevance (Low-High)" },{ value: "name_asc", label: "Name (A-Z)" },{ value: "name_desc", label: "Name (Z-A)" },].map(option => (<DropdownMenuCheckboxItem key={option.value} checked={currentSort === option.value} onCheckedChange={() => onSortChange('authors', option.value as AuthorSortOption)} onSelect={(e) => e.preventDefault()}>{option.label}</DropdownMenuCheckboxItem>))}</DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                    </>
                );
            case 'facts':
                return (
                    <>
                        <FilterButtonWithTooltip tooltipText="Filter Fact Type" shortcutHint="Alt+F">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><Filter className="mr-2 h-4 w-4" />{currentFilter === 'all' ? 'All Fact Types' : (currentFilter === 'fun' ? 'Fun Facts' : 'Science Facts')}<ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent><DropdownMenuRadioGroup value={currentFilter} onValueChange={(val) => onFilterChange('facts', val as "all" | "fun" | "science")}><DropdownMenuRadioItem value="all">All Fact Types</DropdownMenuRadioItem><DropdownMenuRadioItem value="fun">Fun Facts</DropdownMenuRadioItem><DropdownMenuRadioItem value="science">Science Facts</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                        <FilterButtonWithTooltip tooltipText="Sort Facts" shortcutHint="Alt+S">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">{textSortOptions.map(opt => <DropdownMenuCheckboxItem key={opt.value} checked={currentSort === opt.value} onCheckedChange={() => onSortChange('facts', opt.value)}>{opt.label}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                    </>
                );
            case 'tools':
                return (
                    <>
                        <FilterButtonWithTooltip tooltipText="Filter Tool Type" shortcutHint="Alt+T">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><Filter className="mr-2 h-4 w-4" />{currentFilter === 'all' ? 'All Tool Types' : (currentFilter === 'free' ? 'Free Tools' : 'Paid Tools')}<ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent><DropdownMenuRadioGroup value={currentFilter} onValueChange={(val) => onFilterChange('tools', val as "all" | "free" | "paid")}><DropdownMenuRadioItem value="all">All Tool Types</DropdownMenuRadioItem><DropdownMenuRadioItem value="free">Free Tools</DropdownMenuRadioItem><DropdownMenuRadioItem value="paid">Paid Tools</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                        <FilterButtonWithTooltip tooltipText="Sort Tools" shortcutHint="Alt+S">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">{nameSortOptions.map(opt => <DropdownMenuCheckboxItem key={opt.value} checked={currentSort === opt.value} onCheckedChange={() => onSortChange('tools', opt.value)}>{opt.label}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                    </>
                );
            case 'newsletters':
                return (
                    <>
                        <FilterButtonWithTooltip tooltipText="Filter by Frequency" shortcutHint="Alt+N">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><Filter className="mr-2 h-4 w-4" />{currentFilter === 'all' ? 'All Frequencies' : currentFilter}<ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent><DropdownMenuRadioGroup value={currentFilter} onValueChange={(val) => onFilterChange('newsletters', val)}><DropdownMenuRadioItem value="all">All Frequencies</DropdownMenuRadioItem>{COMMON_FREQUENCIES.map(freq => <DropdownMenuRadioItem key={freq} value={freq}>{freq}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                         <FilterButtonWithTooltip tooltipText="Sort Newsletters" shortcutHint="Alt+S">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">{nameSortOptions.map(opt => <DropdownMenuCheckboxItem key={opt.value} checked={currentSort === opt.value} onCheckedChange={() => onSortChange('newsletters', opt.value)}>{opt.label}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                    </>
                );
            case 'podcasts':
                return (
                    <>
                        <FilterButtonWithTooltip tooltipText="Filter by Frequency" shortcutHint="Alt+P">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><Filter className="mr-2 h-4 w-4" />{currentFilter === 'all' ? 'All Frequencies' : currentFilter}<ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent><DropdownMenuRadioGroup value={currentFilter} onValueChange={(val) => onFilterChange('podcasts', val)}><DropdownMenuRadioItem value="all">All Frequencies</DropdownMenuRadioItem>{COMMON_FREQUENCIES.map(freq => <DropdownMenuRadioItem key={freq} value={freq}>{freq}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                        <FilterButtonWithTooltip tooltipText="Sort Podcasts" shortcutHint="Alt+S">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">{nameSortOptions.map(opt => <DropdownMenuCheckboxItem key={opt.value} checked={currentSort === opt.value} onCheckedChange={() => onSortChange('podcasts', opt.value)}>{opt.label}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
                            </DropdownMenu>
                        </FilterButtonWithTooltip>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 p-3 rounded-md bg-card/80 backdrop-blur-sm border border-border/50">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {renderFilters()}
            </div>
            {currentContentDisplayView !== 'savedItems' && (
                 <FilterButtonWithTooltip tooltipText="Toggle Selected View" shortcutHint="Alt+V">
                    <div className="flex items-center space-x-2">
                        <Switch id={`show-selected-filter-${activeUITab}`} checked={showOnlySelected[activeUITab]} onCheckedChange={(checked) => onShowOnlySelectedChange(activeUITab, checked)} aria-label="Show only selected items" />
                        <Label htmlFor={`show-selected-filter-${activeUITab}`} className="text-sm text-foreground/80">Show Only Selected</Label>
                    </div>
                 </FilterButtonWithTooltip>
            )}
        </div>
    );
}

