"use client";

import { Post } from "contentlayer/generated";
import { useState, SetStateAction } from "react";
import ReactPaginate from "react-paginate";
import BlogCard from "./Blog/BlogCard";

interface PaginationProps {
  posts: Post[];
}

const PostAndPagination = ({ posts }: PaginationProps) => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = Math.ceil(posts.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const subset = posts.slice(startIndex, endIndex);

  const handlePageChange = (selectedPage: {
    selected: SetStateAction<number>;
  }) => {
    setCurrentPage(selectedPage.selected);
  };

  return (
    <div className="flex flex-col w-full mb-20">
      <div className="flex flex-col gap-y-10 w-full mb-10">
        {!subset.length && (
          <p className="self-center py-20 text-lg">No posts found...</p>
        )}
        {subset.map((item) => (
          <BlogCard key={item._id} post={item} />
        ))}
      </div>
      {!subset.length ? null : (
        <ReactPaginate
          pageCount={pageCount}
          onPageChange={handlePageChange}
          containerClassName={"flex items-center justify-center gap-8 mt-auto"}
          activeClassName="bg-secondary py-1 px-2 border rounded"
          disabledClassName="opacity-40"
        />
      )}
    </div>
  );
};

export default PostAndPagination;
