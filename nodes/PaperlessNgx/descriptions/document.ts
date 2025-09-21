import { INodeTypeDescription } from 'n8n-workflow';
import { Resource, Operation } from '../shared/constants';

export const documentCreateProperties: INodeTypeDescription['properties'] = [
	{
		displayName: 'File',
		name: 'file',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [Resource.Document], operation: [Operation.Create] } },
		default: '',
		description: 'File to add',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [Resource.Document], operation: [Operation.Create] } },
		options: [
			{ displayName: 'Archive Serial Number', name: 'archive_serial_number', type: 'string', default: '', description: 'Archive serial number to assign to the document' },
			{ displayName: 'Correspondent ID', name: 'correspondent', type: 'number', default: 0, description: 'ID of the correspondent to assign to the document' },
			{ displayName: 'Created Date', name: 'created', type: 'dateTime', default: '', description: 'Date when the document was created' },
			{ displayName: 'Custom Fields IDs', name: 'custom_fields', type: 'string', default: '', description: 'Comma-separated list of custom field IDs to assign to the document', placeholder: '1,2,3' },
			{ displayName: 'Document Type ID', name: 'document_type', type: 'number', default: 0, description: 'ID of the document type to assign to the document' },
			{ displayName: 'Storage Path ID', name: 'storage_path', type: 'number', default: 0, description: 'ID of the storage path to assign to the document' },
			{ displayName: 'Tags IDs', name: 'tags', type: 'string', default: '', description: 'Comma-separated list of tag IDs to assign to the document', placeholder: '1,2,3' },
			{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Title of the document' },
		],
	},
];

export const documentReadProperties: INodeTypeDescription['properties'] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [Resource.Document], operation: [Operation.Read] } },
		options: [ { displayName: 'Search', name: 'search', type: 'string', default: '' } ],
	},
];

export const documentListProperties: INodeTypeDescription['properties'] = [
	{
		displayName: 'Suchoptionen',
		name: 'searchOptions',
		type: 'collection',
		placeholder: 'Suchfilter hinzufügen',
		default: {},
		displayOptions: { show: { resource: [Resource.Document], operation: [Operation.List] } },
		options: [
			{ displayName: 'Volltextsuche', name: 'query', type: 'string', placeholder: 'z.B. Rechnung 2023', description: 'Volltext-Suchbegriff für Dokumente', default: '' },
			{ displayName: 'Ähnliche Dokumente', name: 'more_like_id', type: 'number', placeholder: '1234', description: 'Dokumente finden, die ähnlich zum Dokument mit dieser ID sind', default: 0 },
		],
	},
	{
		displayName: 'Filter',
		name: 'filters',
		type: 'collection',
		placeholder: 'Filter hinzufügen',
		default: {},
		displayOptions: { show: { resource: [Resource.Document], operation: [Operation.List] } },
		options: [
			{ displayName: 'Correspondent Names or IDs', name: 'correspondent__id__in', type: 'multiOptions', typeOptions: { loadOptionsMethod: 'getCorrespondents' }, description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>', default: [] },
			{ displayName: 'Document Type Names or IDs', name: 'document_type__id__in', type: 'multiOptions', typeOptions: { loadOptionsMethod: 'getDocumentTypes' }, description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>', default: [] },
			{ displayName: 'Tag Names or IDs', name: 'tags__id__in', type: 'multiOptions', typeOptions: { loadOptionsMethod: 'getTags' }, description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>', default: [] },
			{ displayName: 'Zeitraum Bis', name: 'created__date__lt', type: 'dateTime', description: 'Datum bis zu dem Dokumente angezeigt werden sollen', default: '' },
			{ displayName: 'Zeitraum Von', name: 'created__date__gt', type: 'dateTime', description: 'Datum ab dem Dokumente angezeigt werden sollen', default: '' },
		],
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		description: 'Max number of results to return',
		default: 50,
		displayOptions: { show: { resource: [Resource.Document], operation: [Operation.List] } },
	},
	{
		displayName: 'Ordering',
		name: 'ordering',
		type: 'options',
		options: [
			{ name: 'Newest First', value: '-created' },
			{ name: 'Oldest First', value: 'created' },
			{ name: 'Relevance', value: '' },
			{ name: 'Title (A-Z)', value: 'title' },
			{ name: 'Title (Z-A)', value: '-title' },
		],
		default: '-created',
		description: 'Sort order of the results',
		displayOptions: { show: { resource: [Resource.Document], operation: [Operation.List] } },
	},
];

export const documentUpdateProperties: INodeTypeDescription['properties'] = [
	{
		displayName: 'Document ID',
		name: 'id',
		type: 'number',
		required: true,
		displayOptions: { show: { resource: [Resource.Document], operation: [Operation.Update] } },
		default: 0,
		description: 'ID des zu aktualisierenden Dokuments',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Felder aktualisieren',
		default: {},
		displayOptions: { show: { resource: [Resource.Document], operation: [Operation.Update] } },
		options: [
			{ displayName: 'Archive Serial Number', name: 'archive_serial_number', type: 'string', default: '', description: 'Archivierungsnummer' },
			{ displayName: 'Correspondent ID', name: 'correspondent', type: 'number', default: 0, description: 'ID des Korrespondenten' },
			{ displayName: 'Created Date', name: 'created', type: 'dateTime', default: '', description: 'Neues Erstellungsdatum des Dokuments' },
			{ displayName: 'Custom Fields', name: 'custom_fields', type: 'json', default: '{}', description: 'Benutzerdefinierte Felder im JSON-Format, z.B. {"field_id": "value"}.' },
			{ displayName: 'Document Type ID', name: 'document_type', type: 'number', default: 0, description: 'ID des Dokumenttyps' },
			{ displayName: 'Storage Path ID', name: 'storage_path', type: 'number', default: 0, description: 'ID des Speicherpfads' },
			{ displayName: 'Tags Names or IDs', name: 'tags', type: 'multiOptions', typeOptions: { loadOptionsMethod: 'getTags' }, default: [], description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>' },
			{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Neuer Titel des Dokuments' },
		],
	},
];


