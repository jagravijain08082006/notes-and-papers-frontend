"use client";

import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { bff } from "@/services/api-client";
import { contactSchema, type ContactValues } from "@/lib/validation";
import { useOnline } from "./offline-banner";
import { useMe } from "@/hooks/use-me";
import type { Me } from "@/lib/api/types";

export function ContactForm() {
  const { data: user, isPending } = useMe();
  if (isPending) return <p role="status">Checking your account...</p>;
  if (!user) return <Link href="/login?next=%2Fcontact%3Fsupport%3Dchat" className="text-link underline">Log in to contact support</Link>;
  return <AccountContactForm key={user.id} user={user} />;
}

function AccountContactForm({ user }: { user: Me }) {
  const online = useOnline();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, touchedFields, isValid, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: { name: user.display_name || user.email?.split("@")[0] || "Student", email: user.email || "", message: "" },
  });

  async function onSubmit(values: ContactValues) {
    try {
      await bff("contact", { method: "POST", body: values });
      toast.success("Message sent. Thank you!");
      reset(undefined, { keepIsSubmitSuccessful: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-xs text-muted-foreground">Fields marked * are required.</p>
      <Field
        id="name"
        label="Your name"
        required
        error={touchedFields.name ? errors.name?.message : undefined}
      >
        <Input
          id="name"
          placeholder="Your full name"
          autoComplete="name"
          readOnly
          aria-required="true"
          invalid={!!(touchedFields.name && errors.name)}
          {...register("name")}
        />
      </Field>
      <Field
        id="email"
        label="Email address"
        required
        error={touchedFields.email ? errors.email?.message : undefined}
      >
        <Input
          id="email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          readOnly
          aria-required="true"
          invalid={!!(touchedFields.email && errors.email)}
          {...register("email")}
        />
      </Field>
      <Field
        id="message"
        label="Message"
        required
        error={touchedFields.message ? errors.message?.message : undefined}
      >
        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <Textarea
              id="message"
              placeholder="Tell us how we can help"
              aria-required="true"
              invalid={!!(touchedFields.message && errors.message)}
              {...field}
            />
          )}
        />
      </Field>
      <Button
        type="submit"
        disabled={!isValid || isSubmitting || !online}
        aria-disabled={!isValid || isSubmitting || !online}
      >
        {isSubmitting ? <Spinner label="Sending" /> : "Send message"}
      </Button>
      {isSubmitSuccessful && (
        <p role="status" className="text-sm text-success">
          Thank you. We read every message.
        </p>
      )}
    </form>
  );
}
