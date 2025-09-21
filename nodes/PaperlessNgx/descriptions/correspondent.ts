import { INodeTypeDescription } from 'n8n-workflow';
import { Resource, Operation } from '../shared/constants';

export const correspondentProperties: INodeTypeDescription['properties'] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: [Resource.Correspondent], operation: [Operation.Create] } },
		description: 'Name of the correspondent',
	},
	{
		displayName: 'Matching Regex',
		name: 'matchingRegex',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: [Resource.Correspondent], operation: [Operation.Create] } },
		description: 'Regular expression to match this correspondent',
	},
];


