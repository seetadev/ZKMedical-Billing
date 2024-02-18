import MaxWidthWrapper from "@/components/MaxWidthWrapper";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MaxWidthWrapper>
      {children}
    </MaxWidthWrapper>
  );
};

export default HomeLayout;
