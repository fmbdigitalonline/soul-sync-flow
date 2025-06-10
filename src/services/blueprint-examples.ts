
import { BlueprintData } from './blueprint-service';

// HEALTH CHECK MODE: All sample data disabled
// This file is now empty to force real calculation failures

export const sampleBlueprints: BlueprintData[] = [];

export const exampleFeurionBlueprint: BlueprintData | null = null;

export const importBlueprintFromJson = (jsonText: string): { data?: BlueprintData; error?: string } => {
  try {
    const parsed = JSON.parse(jsonText);
    return { data: parsed as BlueprintData };
  } catch (error) {
    throw new Error("HEALTH CHECK: JSON import failed - " + error.message);
  }
};
