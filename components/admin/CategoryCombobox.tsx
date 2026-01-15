"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Category {
  value: string;
  label: string;
}

const defaultCategories: Category[] = [
  { value: "ai", label: "AI" },
  { value: "ml", label: "Machine Learning" },
  { value: "data-science", label: "Data Science" },
  { value: "engineering", label: "Engineering" },
  { value: "research", label: "Research" },
];

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  categories?: Category[];
  className?: string;
}

export function CategoryCombobox({
  value,
  onChange,
  categories = [],
  className,
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Merge passed categories with defaults, removing duplicates
  const allCategories = React.useMemo(() => {
    const merged = [...defaultCategories];
    categories.forEach((cat) => {
      if (!merged.some((c) => c.value === cat.value)) {
        merged.push(cat);
      }
    });
    return merged.sort((a, b) => a.label.localeCompare(b.label));
  }, [categories]);

  // Check if the current search value matches any existing category
  const exactMatch = allCategories.find(
    (category) => category.value.toLowerCase() === searchValue.toLowerCase() ||
                  category.label.toLowerCase() === searchValue.toLowerCase()
  );

  // Show "Create new" option if there's a search value and no exact match
  const showCreateNew = searchValue.trim() !== "" && !exactMatch;

  // Get the display label for the current value
  const displayLabel = allCategories.find((c) => c.value === value)?.label || value;

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue === value ? "" : selectedValue);
    setOpen(false);
    setSearchValue("");
  };

  const handleCreateNew = () => {
    onChange(searchValue.toLowerCase().replace(/\s+/g, "-"));
    setOpen(false);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-12 w-full justify-between text-base border-primary",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? displayLabel : "Select category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search categories..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>
            {showCreateNew ? (
              <button
                className="w-full px-2 py-3 text-sm text-left hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={handleCreateNew}
              >
                + Create new: &quot;{searchValue}&quot;
              </button>
            ) : (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                No category found. Type to create one.
              </div>
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {allCategories
              .filter(
                (category) =>
                  category.value.toLowerCase().includes(searchValue.toLowerCase()) ||
                  category.label.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.label}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
