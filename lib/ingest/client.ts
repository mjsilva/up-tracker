import { EventSchemas, Inngest } from "inngest";
import { InngestEvents } from "@/lib/ingest/schemas";

export const inngest = new Inngest({
  id: "up-tracker",
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
});
