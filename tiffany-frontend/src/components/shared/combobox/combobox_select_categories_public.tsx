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

  const sizeClasses = { sm: "h-[1.3rem] text-[11px]", md: "h-[1.4625rem] text-[11px]", lg: "h-[1.625rem] text-[12px]" };

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
    <div className="flex flex-col gap-[0.1625rem] w-full">
      {label && (
        <div className="flex items-center gap-[0.325rem]">
          <div className="flex items-center justify-center w-[1.1375rem] h-[1.1375rem] rounded-[0.325rem] bg-blue-500/10">
            <Package className="h-[0.56875rem] w-[0.56875rem] text-blue-500" />
          </div>
          <Label className="text-[11px] font-medium text-foreground">{label}</Label>
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-w-[150px] px-[0.4875rem] py-[0.325rem] transition-all duration-200 border-input",
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
                "ml-[0.325rem] h-[0.65rem] w-[0.65rem] shrink-0 transition-all duration-200",
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
            <CommandList className="max-h-[9.75rem] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-[0.65rem]">
                  <Loader2 className="h-[0.8125rem] w-[0.8125rem] animate-spin text-primary" />
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
                            "mr-[0.325rem] h-[0.65rem] w-[0.65rem]",
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
