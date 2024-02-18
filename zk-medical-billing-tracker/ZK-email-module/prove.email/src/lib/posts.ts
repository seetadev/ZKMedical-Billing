import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";

export interface Post {
  slug: string;
  title: string;
  date: string;
  content: any;
}

export async function getAllPosts(): Promise<Post[]> {
  const root = process.cwd();
  const postsPath = path.join(root, "posts");
  const posts = fs.readdirSync(postsPath);

  const processedPosts = await Promise.all(
    posts.map(async (filename) => {
      const markdownWithMeta = fs.readFileSync(`posts/${filename}`);

      const { data, content } = matter(markdownWithMeta);

      const mdxSource = await serialize(content);

      return {
        slug: filename.replace(".mdx", ""),
        title: data.title,
        date: data.date.toISOString(),
        content: mdxSource,
      };
    })
  );
  return processedPosts;
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const filePath = path.join("posts", `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, "utf8");

  const { data, content } = matter(fileContents);

  const mdxSource = await serialize(content); // serialize the content

  return {
    slug: slug,
    title: data.title,
    date: data.date.toISOString(),
    content: mdxSource,
  };
}
