"use client";

import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useSortAndFilterStore } from "@/store/sortAndFilterStore";

export interface SortAndFilterProps {
  isMobile?: boolean;
}

const SortAndFilter = ({ isMobile }: SortAndFilterProps) => {
  const {
    newest,
    recommended,
    setNewest,
    setRecommended,
    searchInput,
    setSearchInput,
    oldest,
    setOldest,
  } = useSortAndFilterStore();

  return (
    <div className={cn("lg:flex", isMobile ? "flex" : "hidden")}>
      <div className="flex flex-col">
        <Input
          placeholder="Search on blog..."
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-fit mb-10 max-lg:hidden"
          value={searchInput}
        />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold mb-5">Order by</h1>
          <div className="flex flex-col">
            <Button
              onClick={() => {
                setRecommended(true);
                setNewest(false);
                setOldest(false)
              }}
              variant={"link"}
              className={cn(
                "w-fit p-0 m-0",
                !recommended && "text-muted-foreground"
              )}
            >
              Recommended
            </Button>
            <Button
              onClick={() => {
                setNewest(true);
                setOldest(false);
                setRecommended(false);
              }}
              variant={"link"}
              className={cn(
                "w-fit p-0 m-0",
                !newest && "text-muted-foreground"
              )}
            >
              Newest
            </Button>
            <Button
              onClick={() => {
                setNewest(false);
                setOldest(true);
                setRecommended(false);
              }}
              variant={"link"}
              className={cn(
                "w-fit p-0 m-0",
                !oldest && "text-muted-foreground"
              )}
            >
              Oldest
            </Button>
          </div>
        </div>
      </div>
      <Separator className="h-full mx-8" orientation="vertical" />
    </div>
  );
};

export default SortAndFilter;
