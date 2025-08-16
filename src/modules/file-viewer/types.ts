export type TFileSystemSnapshot = {
  files: Record<string, string>;
  meta: {
    projectName: string;
    totalFiles: number;
    generatedAt: string;
  };
};

export type TFileNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TFileNode[];
  content?: string;
  expanded?: boolean;
};

export type TFileState = {
  currentFile: string | null;
  isEditing: boolean;
  content: string;
};

export type TDrizzleSchema = {
  tableName: string;
  fields: TFieldDefinition[];
  exports: string[];
};

export type TFieldDefinition = {
  name: string;
  type: string;
  constraints: string[];
};

export type TCodeGenType = 
  | 'server-functions'
  | 'api-routes'
  | 'crud-operations'
  | 'type-definitions';

export type TStoredSnapshot = {
  id: string;
  name: string;
  snapshot: TFileSystemSnapshot;
  createdAt: string;
  updatedAt: string;
};
