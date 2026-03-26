"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateEventForm } from "@/components/live/create-event-form";
import { JoinEventForm } from "@/components/live/join-event-form";

export default function LiveHomePage() {
  return (
    <>
      <PageHeader
        title="Live Events"
        description="Create or join a live scoring event"
      />

      <Tabs defaultValue="join" className="space-y-4">
        <TabsList>
          <TabsTrigger value="join">Join Event</TabsTrigger>
          <TabsTrigger value="create">Create Event</TabsTrigger>
        </TabsList>

        <TabsContent value="join">
          <JoinEventForm />
        </TabsContent>

        <TabsContent value="create">
          <CreateEventForm />
        </TabsContent>
      </Tabs>
    </>
  );
}
