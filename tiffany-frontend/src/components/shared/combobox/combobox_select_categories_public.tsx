"use client";

import { useEffect, useState, useRef, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, Package } from "lucide-react";
import { useAppDispatch } from "@/redux/store/hooks";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { fetchPublicCategories } from "@/redux/features/main/store/thunks/public-categories-thunks";

interface ComboboxSelectCategoriesPublicProps {
  selectedCategory: string;
  onChangeSelected: (categoryId: string) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
}

const ALL_OPTION: CategoriesResponseModel = {
  id: "",
  name: "All",
  description: "",
} as unknown as CategoriesResponseModel;

function ComboboxSelectCategoriesPublicComponent({
  selectedCategory,
  onChangeSelected,
  disabled = false,
  label = "Category",
  size = "md",
  placeholder = "All Categories",
}: ComboboxSelectCategoriesPublicProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allCategories, setAllCategories] = useState<CategoriesResponseModel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchedRef = useRef(false);

  const sizeClasses = { sm: "h-8 text-xs", md: "h-9 text-sm", lg: "h-10 text-base" };

  // Fetch all categories once on mount — backend returns a flat array
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setLoading(true);
    dispatch(fetchPublicCategories({ status: "ACTIVE", pageSize: 200 }))
      .unwrap()
      .then((result) => {
        // Backend returns a direct array (not paginated)
        const items: CategoriesResponseModel[] = Array.isArray(result)
          ? result
          : (result.content ?? result ?? []);
        setAllCategories(items);
      })
      .catch((err) => console.error("Failed to load categories:", err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side filtering
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const cats = q
      ? allCategories.filter((c) => c.name.toLowerCase().includes(q))
      : allCategories;
    return [ALL_OPTION, ...cats];
  }, [allCategories, searchTerm]);

  const selectedCategoryName = allCategories.find((c) => c.id === selectedCategory)?.name;

  const handleSelect = (categoryId: string) => {
    onChangeSelected(categoryId);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10">
            <Package className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <Label className="text-xs font-medium text-foreground">{label}</Label>
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-w-[150px] px-3 py-2 transition-all duration-200 border-input",
              sizeClasses[size],
              !selectedCategory && "text-muted-foreground",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
              open && "bg-primary/20 border-primary text-primary",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            disabled={disabled}
          >
            <span className="truncate">{selectedCategoryName || placeholder}</span>
            <ChevronsUpDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 transition-all duration-200",
                open ? "opacity-100 text-primary rotate-180" : "opacity-50",
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg border-border"
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search category..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {filtered.map((item, index) => (
                      <CommandItem
                        key={item.id || `all-${index}`}
                        value={item.name}
                        onSelect={() => handleSelect(item.id)}
                        className={cn(
                          sizeClasses[size],
                          "hover:bg-primary/10 hover:text-primary cursor-pointer",
                          (selectedCategory === item.id || (!selectedCategory && item.id === "")) &&
                            "bg-primary/20 text-primary font-medium",
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            (selectedCategory === item.id || (!selectedCategory && item.id === ""))
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {item.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const ComboboxSelectCategoriesPublic = memo(ComboboxSelectCategoriesPublicComponent);
