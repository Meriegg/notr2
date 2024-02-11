import { XIcon } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { loginAction } from "~/server/actions/login";

const Page = ({
  searchParams: { error },
}: {
  searchParams: { error?: string | null };
}) => {
  return (
    <div
      className="mx-auto flex h-[100vh] flex-col items-center justify-center gap-6"
      style={{ width: "min(350px, 100%)" }}
    >
      {error && (
        <Alert variant="destructive">
          <XIcon className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <h1 className="text-xl font-semibold tracking-normal text-neutral-700">
        Log into your account
      </h1>
      <p className="-mt-4 text-center text-sm text-neutral-900">
        By logging in you accept our{" "}
        <Link
          href="#"
          className="text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Privacy policy
        </Link>
      </p>

      <form className="flex w-full flex-col gap-2" action={loginAction}>
        <Label htmlFor="email_input">Email</Label>
        <Input
          id="email_input"
          name="email"
          type="email"
          placeholder="john@example.com"
          required={true}
        />

        <Button type="submit" variant="secondary" className="w-full">
          Log in!
        </Button>
      </form>

      <div className="-mt-4 flex w-full items-center justify-start">
        <Link
          href="/signUp"
          className="w-fit text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Sign up?
        </Link>
      </div>
    </div>
  );
};

export default Page;
