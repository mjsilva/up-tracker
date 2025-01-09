"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export function ApiKeyHelperModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help for Up Bank API Key</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How to get your Up Bank API key</DialogTitle>
          <DialogDescription>
            Follow these steps to obtain your Up Bank API key:
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ol className="list-inside list-decimal space-y-2">
            <li>
              Go{" "}
              <Link
                target={"_blank"}
                href={"https://api.up.com.au/getting_started"}
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline"
              >
                here
                <ExternalLink className="ml-1 h-4 w-4" />
              </Link>{" "}
              and follow UP&apos;s instructions to get an API key
            </li>
            <li>Copy the API key and paste it into the field bellow</li>
            <li>Click save</li>
          </ol>
          <p className="mt-4 text-foreground">
            Api key is a piece of text that should start with{" "}
            <span className={"rounded-lg bg-orange-100 p-1"}>up:yeah:</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
