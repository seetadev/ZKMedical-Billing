import { ListFilter } from "lucide-react";
import SortAndFilter, { SortAndFilterProps } from "./SortAndFilter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const MobileSortAndFilter = ({}: SortAndFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="block lg:hidden w-fit ml-2">
        <ListFilter />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ml-2">
        <DropdownMenuItem>
          <SortAndFilter isMobile />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileSortAndFilter;
