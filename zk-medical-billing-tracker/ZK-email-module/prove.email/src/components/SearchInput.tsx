"use client";

import { Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { useSearchModal } from "@/hooks/useSearchModal";
import { allPosts } from "contentlayer/generated";

const SearchInput = ({ className }: { className?: string }) => {
  const posts = allPosts;
  const { onOpen } = useSearchModal();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpen(posts);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div
      className={cn(
        "drop-shadow rounded relative items-center bg-white border px-2",
        className
      )}
    >
      <Search className="absolute text-muted-foreground" size={18} />
      <Input
        placeholder="Search"
        onClick={() => onOpen(posts)}
        className="ml-6 h-8 cursor-pointer text-black rounded bg-transparent border-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus:ring-0"
      />
      <kbd className="text-sm text-muted-foreground flex items-center gap-1">
        <span className="text-xl">⌘</span>+<span>K</span>
      </kbd>
    </div>
  );
};

export default SearchInput;
