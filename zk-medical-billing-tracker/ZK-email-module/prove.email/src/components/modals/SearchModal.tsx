import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useSearchModal } from "@/hooks/useSearchModal";

export function SearchModal() {
  const { isOpen, onClose, posts } = useSearchModal();
  const router = useRouter();

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder="Search blogs or docs..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Documents">
          <CommandItem
            className="truncate"
            onSelect={() => router.push("https://github.com/zkemail")}
          >
            ZKEmail
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Blogs">
          {posts?.map((post) => (
            <CommandItem
              key={post._id}
              className="truncate"
              onSelect={() => {
                router.push(`/blog/${post.slug}`);
                onClose();
              }}
            >
              {post.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
