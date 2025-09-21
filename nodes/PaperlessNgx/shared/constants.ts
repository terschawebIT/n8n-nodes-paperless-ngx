export type ValueOf<T> = T[keyof T];

export const Resource = {
	Correspondent: 'correspondent',
	DocumentType: 'documentType',
	Document: 'document',
	Tag: 'tag',
} as const;

export const Operation = {
	Create: 'create',
	Read: 'read',
	Update: 'update',
	Delete: 'delete',
	List: 'list',
	Download: 'download',
} as const;


