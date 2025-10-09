import type { Environment } from '@/features/environments/types';

/**
 * Interpolates variables in a string using the format {{variableName}} or ${variableName}
 * Variables are resolved from the environment first, then from global variables
 *
 * @param text - The text containing variable placeholders
 * @param selectedEnvironment - The currently selected environment (or null)
 * @param globalVariables - Global/collection variables
 * @returns The text with variables replaced by their values
 */
export const interpolateVariables = (
  text: string,
  selectedEnvironment: Environment | null,
  globalVariables: Record<string, string> = {}
): string => {
  if (!text) return text;

  // Create a combined variables map with priority: environment > global
  const variables: Record<string, string> = {
    ...globalVariables,
    ...(selectedEnvironment?.variables || {}),
  };

  // Replace {{variableName}} syntax (Postman style)
  let result = text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    return variables[trimmedName] !== undefined ? variables[trimmedName] : match;
  });

  // Replace ${variableName} syntax (JavaScript template literal style)
  result = result.replace(/\$\{([^}]+)\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    return variables[trimmedName] !== undefined ? variables[trimmedName] : match;
  });

  return result;
};

/**
 * Interpolates variables in an object's values (useful for headers, query params)
 *
 * @param obj - Object with string values
 * @param selectedEnvironment - The currently selected environment
 * @param globalVariables - Global/collection variables
 * @returns New object with interpolated values
 */
export const interpolateObjectValues = (
  obj: Record<string, string>,
  selectedEnvironment: Environment | null,
  globalVariables: Record<string, string> = {}
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    result[key] = interpolateVariables(value, selectedEnvironment, globalVariables);
  }

  return result;
};

/**
 * Gets all available variables for autocomplete/preview
 *
 * @param selectedEnvironment - The currently selected environment
 * @param globalVariables - Global/collection variables
 * @returns Array of variable names
 */
export const getAvailableVariables = (
  selectedEnvironment: Environment | null,
  globalVariables: Record<string, string> = {}
): string[] => {
  const envVars = Object.keys(selectedEnvironment?.variables || {});
  const globalVars = Object.keys(globalVariables);

  // Combine and deduplicate (environment variables take priority)
  return [...new Set([...envVars, ...globalVars])];
};
