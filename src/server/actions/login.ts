"use server";

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { api } from "~/trpc/server";
import { createEmailVerificationToken } from "../utils/auth/verification-tokens/email-verification";
import { env } from "~/env";

export const loginAction = async (data: FormData) => {
  const cookieStore = cookies();

  const formData = {
    email: data.get("email"),
  };

  const submitData = z
    .object({
      email: z.string().email(),
    })
    .parse(formData);

  const apiData = await api.auth.login
    .mutate({ ...submitData })
    .catch((error) => {
      console.error(error);
      redirect(`/login?error=${error?.message ?? "Something went wrong"}`);
    });

  const emailVerificationToken = createEmailVerificationToken({
    userId: apiData.userId,
  });
  cookieStore.set("email-verification-token", emailVerificationToken, {
    maxAge: 60 * 60 * 12,
    path: "/",
    secure: env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
    sameSite: true,
  });

  const finalRedirect = data.get("finalRedirect");

  redirect(
    `/verify?userId=${apiData.userId}${finalRedirect ? `&redirectTo=${finalRedirect}` : ""}`,
  );
};
