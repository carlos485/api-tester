import type { Environment } from '../../environments/types/environment.types';

export interface Project {
  id: string;
  name: string;
  description?: string;
  icon: string; // Icon identifier from iconify
  createdAt: Date;
  updatedAt: Date;
  environments: Environment[];
  collectionVariables?: Record<string, string>; // Collection-level variables
}
