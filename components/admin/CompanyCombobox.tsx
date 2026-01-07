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

interface Company {
  id: string;
  name: string;
}

interface CompanyComboboxProps {
  value: string;
  onChange: (value: string) => void;
  companies: Company[];
  className?: string;
}

export function CompanyCombobox({
  value,
  onChange,
  companies,
  className,
}: CompanyComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Sort companies alphabetically
  const sortedCompanies = React.useMemo(() => {
    return [...companies].sort((a, b) => a.name.localeCompare(b.name));
  }, [companies]);

  // Check if the current search value matches any existing company
  const exactMatch = sortedCompanies.find(
    (company) => company.name.toLowerCase() === searchValue.toLowerCase()
  );

  // Show "Create new" option if there's a search value and no exact match
  const showCreateNew = searchValue.trim() !== "" && !exactMatch;

  const handleSelect = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue);
    setOpen(false);
    setSearchValue("");
  };

  const handleCreateNew = () => {
    onChange(searchValue);
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
          {value || "Select company..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search companies..."
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
                {companies.length === 0
                  ? "No companies yet. Type to create one."
                  : "No company found."}
              </div>
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {sortedCompanies
              .filter((company) =>
                company.name.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.name}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === company.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {company.name}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
