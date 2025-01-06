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
            <li>Log in to your Up Bank account</li>
            <li>Go to the &#34;Settings&#34; or &#34;Developer&#34; section</li>
            <li>Look for an option to create or manage API keys</li>
            <li>Generate a new API key</li>
            <li>
              Copy the API key and paste it into the field in the settings
            </li>
          </ol>
          <p className="mt-4">
            For more detailed instructions, please visit the{" "}
            <a
              href="https://developer.up.com.au/#getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:underline"
            >
              Up Bank API documentation
              <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
