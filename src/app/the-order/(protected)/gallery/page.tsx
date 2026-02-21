import { gameConfig, getOrderedSteps } from "@/config";
import { gallerySetup } from "@/lib/actions/gallery";
import ComponentGallery from "@/components/admin/gallery/ComponentGallery";
import type { ComponentConfig } from "@/config";

/**
 * Find the first website step in gameConfig to use as the initial gallery component.
 */
function findFirstWebsiteStep() {
  for (const [chapterId, chapter] of Object.entries(gameConfig.chapters)) {
    const steps = getOrderedSteps(chapter);
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.type === "website") {
        return {
          chapterId,
          stepIndex: i,
          component: step.component,
          config: step.config as ComponentConfig,
        };
      }
    }
  }
  throw new Error("No website steps found in gameConfig");
}

export default async function GalleryPage() {
  const first = findFirstWebsiteStep();
  const context = await gallerySetup(first.chapterId, first.stepIndex);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-admin-text-dark tracking-wide">
          Component Gallery
        </h1>
        <p className="text-xs text-admin-text-faint mt-1">
          Test quest components and building blocks in isolation with real DB operations on the test track.
        </p>
      </div>
      <ComponentGallery
        initialContext={{
          stepProgressId: context.stepProgressId,
          chapterId: first.chapterId,
          stepIndex: first.stepIndex,
        }}
        initialComponent={first.component}
        initialConfig={first.config}
      />
    </div>
  );
}
