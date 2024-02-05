const Page = ({
  searchParams: { message },
}: {
  searchParams: { message: string };
}) => {
  return <p>Failed to sign up: {message}</p>;
};

export default Page;
