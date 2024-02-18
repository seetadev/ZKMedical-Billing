import { Post } from "contentlayer/generated";
import { formatDistance } from "date-fns";
import GradientButton from "../GradientButton";

interface BlogCardProps {
  post: Post;
}

const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <div className="flex justify-between gap-x-6 border rounded-lg p-7">
      <div className="w-full flex flex-col gap-6">
        <h1 className="text-lg font-semibold">{post.title}</h1>
        <p className="text-muted-foreground">{post.description}</p>
        <div className="text-muted-foreground text-sm flex items-center gap-3">
          <span>
            {formatDistance(new Date(post.date!), new Date(), {
              addSuffix: true,
            })}
          </span>
          <span>•</span>
          <span>{post.category}</span>
        </div>
        <GradientButton
          href={post.url}
          target="_self"
          size="sm"
          containerStyle="w-full"
          buttonStyle="w-full"
        >
          Read Now
        </GradientButton>
      </div>
    </div>
  );
};

export default BlogCard;
