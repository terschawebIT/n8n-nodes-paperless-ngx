import { INodeTypeDescription } from 'n8n-workflow';
import { Resource, Operation } from '../shared/constants';

export const tagProperties: INodeTypeDescription['properties'] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: [Resource.Tag], operation: [Operation.Create] } },
		description: 'Name of the tag',
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'color',
		default: '#a6cee3',
		displayOptions: { show: { resource: [Resource.Tag], operation: [Operation.Create] } },
		description: 'Color of the tag',
	},
	{
		displayName: 'Matching Regex',
		name: 'matchingRegex',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: [Resource.Tag], operation: [Operation.Create] } },
		description: 'Regular expression to match this tag',
	},
];


