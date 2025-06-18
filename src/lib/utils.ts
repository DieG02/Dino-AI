import { UserProfile } from "../models";

/**
 * Merges two partial UserProfile objects into one, applying optional logic for arrays and empty values.
 *
 * @param original - The base user profile object, typically the existing data.
 * @param updates - The new updates to apply, possibly partial or coming from user input.
 *
 * @returns A new Partial<any> object with the merged values.
 */
export function mergeProfile(
  original: Partial<UserProfile>,
  updates: Partial<UserProfile>
): Partial<UserProfile> {
  const merged: Partial<any> = { ...original };

  for (const key in updates) {
    const field = key as keyof UserProfile;
    const newValue = updates[field];
    const currentValue: any = original[field];

    if (Array.isArray(newValue)) {
      // Merge arrays uniquely only if new array has content
      if (newValue.length) {
        merged[field] = Array.from(
          new Set([...(currentValue || []), ...newValue])
        );
      } else {
        merged[field] = currentValue;
      }
    } else {
      // Merge scalar values only if non-empty string
      if (newValue && newValue !== "") {
        merged[field] = newValue;
      } else {
        merged[field] = currentValue;
      }
    }
  }

  return merged;
}
