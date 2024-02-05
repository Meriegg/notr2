const Page = ({
  searchParams: { message },
}: {
  searchParams: { message: string };
}) => {
  return <p>Failed to verify code: {message}</p>;
};

export default Page;
