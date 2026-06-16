import React from "react";
import { ToolWorkspace } from "../components/ToolWorkspace";
import { useLayout } from "../components/Layout";
import { RelatedTools } from "../components/RelatedTools";
import { ToolExplanation } from "../components/ToolExplanation";

export default function DeletePagesPage() {
  const { toolsList } = useLayout();
  const currentTool = toolsList.find((t) => t.id === "delete-pages");

  if (!currentTool) return null;

  return (
    <div className="space-y-12" id="delete-pages-container">
      <ToolWorkspace tool={currentTool} />
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6">
        <RelatedTools />
      </div>
      <ToolExplanation />
    </div>
  );
}
