"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, Store } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/utils/debounce/debounce";
import { useAppDispatch } from '@/redux/store/hooks';
import { fetchAllLocationsService } from "@/redux/features/location/store/thunks/location-thunks";

interface Location {
  id: string;
  fullAddress: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  streetNumber: string;
  houseNumber: string;
  note: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

interface ComboboxSelectLocationProps {
  dataSelect: Location | null;
  onChangeSelected: (item: Location | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  hasDefault?: boolean;
}

export function ComboboxSelectLocation({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Delivery Address",
  required = false,
  placeholder = "Select address...",
  error,
}: ComboboxSelectLocationProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<Location[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.5 });
  const debouncedSearch = useDebounce(searchTerm, 400);
  const loadingRef = useRef(false);
  const lastPageRef = useRef(false);

  useEffect(() => {
    loadingRef.current = loading;
    lastPageRef.current = lastPage;
  }, [loading, lastPage]);

  const removeDuplicates = (items: Location[]): Location[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const fetchData = async (search: string, newPage: number) => {
    if (loadingRef.current || (lastPageRef.current && newPage > 1)) return;
    setLoading(true);
    try {
      const result = await dispatch(
        fetchAllLocationsService({ search, pageNo: newPage, pageSize: 15 })
      ).unwrap();

      if (!result) return;

      if (newPage === 1) {
        setData(removeDuplicates(result.content || []));
      } else {
        setData((prev) => removeDuplicates([...prev, ...(result.content || [])]));
      }

      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setLastPage(false);
    setData([]);
    fetchData(debouncedSearch, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (inView && !loadingRef.current && !lastPageRef.current && data.length > 0) {
      fetchData(debouncedSearch, page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, page, data.length]);

  const handleSelectPickup = () => {
    onChangeSelected(null);
    setOpen(false);
  };

  const handleSelect = (item: Location) => {
    onChangeSelected(item);
    setOpen(false);
  };

  return (
    <div className="space-y-[0.24375rem] w-full min-w-0">
      {label && (
        <Label className="text-[12px] font-semibold">
          {label}
          {required && <span className="text-red-500 ml-[0.1625rem]">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "!flex w-full justify-between px-[0.4875rem] h-[2.125rem] sm:h-[1.625rem] text-[12px] transition-all duration-200 border-input overflow-hidden",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
              open && "bg-primary/20 border-primary text-primary",
              error && "border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            {dataSelect ? (
              <span className="min-w-0 flex-1 truncate">{dataSelect.fullAddress}</span>
            ) : (
              <span className="flex items-center gap-[0.325rem] text-foreground">
                <Store className="h-[0.56875rem] w-[0.56875rem] shrink-0" />
                Store Pickup
              </span>
            )}
            <ChevronsUpDown className="ml-[0.325rem] h-[0.65rem] w-[0.65rem] shrink-0 opacity-50" />
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
              placeholder="Search address..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="text-[11px] h-[1.7875rem] px-[0.4875rem] border-b"
            />
            <CommandList className="max-h-[7.8rem] overflow-y-auto">
              {/* Always-visible Pickup option */}
              <CommandGroup>
                <CommandItem
                  value="__pickup__"
                  onSelect={handleSelectPickup}
                  className="text-[11px] py-[0.40625rem]"
                >
                  <Check
                    className={cn(
                      "mr-[0.325rem] h-[0.65rem] w-[0.65rem] flex-shrink-0",
                      !dataSelect ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Store className="mr-[0.325rem] h-[0.56875rem] w-[0.56875rem] text-primary shrink-0" />
                  <span className="font-medium">Store Pickup</span>
                </CommandItem>
              </CommandGroup>

              {/* Separator between pickup and address list */}
              {(data.length > 0 || loading) && <CommandSeparator />}

              <CommandGroup>
                {data.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    value={item.fullAddress}
                    onSelect={() => handleSelect(item)}
                    ref={index === data.length - 1 ? ref : null}
                    className="text-[11px] py-[0.325rem]"
                  >
                    <Check
                      className={cn(
                        "mr-[0.325rem] h-[0.65rem] w-[0.65rem] flex-shrink-0",
                        dataSelect?.id === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate line-clamp-1 flex-1">{item.fullAddress}</span>
                    {item.note && (
                      <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-[0.325rem]">
                        ({item.note})
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>

              {loading && (
                <div className="text-center py-[0.325rem]">
                  <Loader2 className="animate-spin text-gray-500 h-[0.65rem] w-[0.65rem] mx-auto" />
                </div>
              )}
              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-[0.1625rem] text-[11px] text-gray-400">
                  No more addresses
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
