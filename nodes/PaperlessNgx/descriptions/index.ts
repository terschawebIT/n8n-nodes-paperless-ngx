import { INodeTypeDescription } from 'n8n-workflow';
import { Resource, Operation } from '../shared/constants';
import { documentCreateProperties, documentReadProperties, documentListProperties, documentUpdateProperties } from './document';
import { correspondentProperties } from './correspondent';
import { tagProperties } from './tag';

export const nodeProperties: INodeTypeDescription['properties'] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		options: [
			{ name: 'Correspondent', value: Resource.Correspondent },
			{ name: 'Document Type', value: Resource.DocumentType },
			{ name: 'Document', value: Resource.Document },
			{ name: 'Tag', value: Resource.Tag },
		],
		default: 'document',
		noDataExpression: true,
		required: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: { show: { resource: [Resource.Document] } },
		options: [
			{ name: 'Create', value: Operation.Create, description: 'Create a document', action: 'Create a document' },
			{ name: 'Read', value: Operation.Read, description: 'Get documents', action: 'Get documents' },
			{ name: 'List', value: Operation.List, description: 'List or search documents', action: 'List or search documents' },
			{ name: 'Update', value: Operation.Update, description: 'Update a document', action: 'Update a document' },
		],
		default: 'read',
		noDataExpression: true,
		required: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: { show: { resource: [Resource.Correspondent] } },
		options: [
			{ name: 'Create', value: Operation.Create, description: 'Create a correspondent', action: 'Create a correspondent' },
			{ name: 'Read', value: Operation.Read, description: 'Get correspondents', action: 'Get correspondents' },
		],
		default: 'read',
		noDataExpression: true,
		required: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: { show: { resource: [Resource.DocumentType] } },
		options: [
			{ name: 'Read', value: Operation.Read, description: 'Get document types', action: 'Get document types' },
		],
		default: 'read',
		noDataExpression: true,
		required: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: { show: { resource: [Resource.Tag] } },
		options: [
			{ name: 'Create', value: Operation.Create, description: 'Create a tag', action: 'Create a tag' },
			{ name: 'Read', value: Operation.Read, description: 'Get tags', action: 'Get tags' },
		],
		default: 'read',
		noDataExpression: true,
		required: true,
	},
	...documentCreateProperties,
	...documentReadProperties,
	...documentListProperties,
	...documentUpdateProperties,
	...correspondentProperties,
	...tagProperties,
];
