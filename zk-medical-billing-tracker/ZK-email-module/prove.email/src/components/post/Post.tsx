// @ts-nocheck

"use client";

import { Post } from "contentlayer/generated";

interface PostProps {
  post: Post;
}

const Post = ({ post }: PostProps) => {
  return (
    <div style={{ padding: "80px" }}>
      <h1>{post.title}</h1>
    </div>
  );
};

export default Post;
