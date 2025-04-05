import {
	BINARY_ENCODING,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
	NodeOperationError,
	PaginationOptions,
	// NodeOperationError,
} from 'n8n-workflow';
import { Readable } from 'stream';

type ValueOf<T> = T[keyof T];

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
} as const;

export class PaperlessNgx implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Paperless-ngx Node',
		name: 'paperlessNgx',
		icon: 'file:paperlessNgx.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Paperless-ngx node',
		defaults: {
			name: 'Paperless-ngx node',
		},
		inputs: ['main'],
		outputs: ['main'],
		// Hinweis: Um diese Node als Tool nutzen zu können,
		// setze die Umgebungsvariable N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Correspondent',
						value: Resource.Correspondent,
					},
					{
						name: 'Document Type',
						value: Resource.DocumentType,
					},
					{
						name: 'Document',
						value: Resource.Document,
					},
					{
						name: 'Tag',
						value: Resource.Tag,
					},
				],
				default: 'document',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.Document],
					},
				},
				options: [
					{
						name: 'Create',
						value: Operation.Create,
						description: 'Create a document',
						action: 'Create a document',
					},
					{
						name: 'Read',
						value: Operation.Read,
						description: 'Get documents',
						action: 'Get documents',
					},
				],
				default: 'read',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.Correspondent],
					},
				},
				options: [
					{
						name: 'Create',
						value: Operation.Create,
						description: 'Create a correspondent',
						action: 'Create a correspondent',
					},
					{
						name: 'Read',
						value: Operation.Read,
						description: 'Get correspondents',
						action: 'Get correspondents',
					},
				],
				default: 'read',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.DocumentType],
					},
				},
				options: [
					{
						name: 'Read',
						value: Operation.Read,
						description: 'Get document types',
						action: 'Get document types',
					},
				],
				default: 'read',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.Tag],
					},
				},
				options: [
					{
						name: 'Create',
						value: Operation.Create,
						description: 'Create a tag',
						action: 'Create a tag',
					},
					{
						name: 'Read',
						value: Operation.Read,
						description: 'Get tags',
						action: 'Get tags',
					},
				],
				default: 'read',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'File',
				name: 'file',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.Create],
					},
				},
				default: '',
				description: 'File to add',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.Create],
					},
				},
				options: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Title of the document',
					},
					{
						displayName: 'Created Date',
						name: 'created',
						type: 'dateTime',
						default: '',
						description: 'Date when the document was created',
					},
					{
						displayName: 'Correspondent ID',
						name: 'correspondent',
						type: 'number',
						default: 0,
						description: 'ID of the correspondent to assign to the document',
					},
					{
						displayName: 'Document Type ID',
						name: 'document_type',
						type: 'number',
						default: 0,
						description: 'ID of the document type to assign to the document',
					},
					{
						displayName: 'Storage Path ID',
						name: 'storage_path',
						type: 'number',
						default: 0,
						description: 'ID of the storage path to assign to the document',
					},
					{
						displayName: 'Tags IDs',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma separated list of tag IDs to assign to the document',
						placeholder: '1,2,3',
					},
					{
						displayName: 'Archive Serial Number',
						name: 'archive_serial_number',
						type: 'string',
						default: '',
						description: 'Archive serial number to assign to the document',
					},
					{
						displayName: 'Custom Fields IDs',
						name: 'custom_fields',
						type: 'string',
						default: '',
						description: 'Comma separated list of custom field IDs to assign to the document',
						placeholder: '1,2,3',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.Read],
					},
				},
				options: [
					{
						displayName: 'Search',
						name: 'search',
						type: 'string',
						default: '',
					},
				],
			},
			// Correspondent Create Parameters
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: [Resource.Correspondent],
						operation: [Operation.Create],
					},
				},
				description: 'Name of the correspondent',
			},
			{
				displayName: 'Matching Regex',
				name: 'matchingRegex',
				type: 'string',
				required: false,
				default: '',
				displayOptions: {
					show: {
						resource: [Resource.Correspondent],
						operation: [Operation.Create],
					},
				},
				description: 'Regular expression to match this correspondent',
			},
			// Tag Create Parameters
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: [Resource.Tag],
						operation: [Operation.Create],
					},
				},
				description: 'Name of the tag',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				required: false,
				default: '#a6cee3',
				displayOptions: {
					show: {
						resource: [Resource.Tag],
						operation: [Operation.Create],
					},
				},
				description: 'Color of the tag',
			},
			{
				displayName: 'Matching Regex',
				name: 'matchingRegex',
				type: 'string',
				required: false,
				default: '',
				displayOptions: {
					show: {
						resource: [Resource.Tag],
						operation: [Operation.Create],
					},
				},
				description: 'Regular expression to match this tag',
			},
		],
		credentials: [
			{
				name: 'paperlessNgxApi',
				required: true,
			},
		],
	} as INodeTypeDescription;

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const credentials = await this.getCredentials('paperlessNgxApi');

		const resource = this.getNodeParameter('resource', 0) as ValueOf<typeof Resource>;
		const operation = this.getNodeParameter('operation', 0) as ValueOf<typeof Operation>;

		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				if (resource === Resource.Document) {
					if (operation === Operation.Read) {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							itemIndex,
						) as IDataObject;

						const requestOptions: IRequestOptions = {
							headers: {
								Accept: 'application/json',
							},
							qs: {
								search: additionalFields.search,
							},
							method: 'GET',
							uri: `${credentials.domain}/api/documents/`,
							json: true,
						};

						const paginationOptions: PaginationOptions = {
							continue: '={{ $response.body["next"] !== null }}',
							request: {
								url: '={{ $response.body["next"] }}',
							},
							requestInterval: 1,
						};

						const responseData = await this.helpers.requestWithAuthenticationPaginated.call(
							this,
							requestOptions,
							itemIndex,
							paginationOptions,
							'paperlessNgxApi',
						);
						const items = responseData.flatMap((response) =>
							response.body.results.map((result: any) => ({ json: result })),
						);
						returnData.push(...items);
					}

					if (operation === Operation.Create) {
						const documentFieldName = this.getNodeParameter('file', itemIndex, 'data') as string;
						const documentData = this.helpers.assertBinaryData(itemIndex, documentFieldName);
						const documentBinaryData = items[itemIndex].binary![documentFieldName];
						let documentUploadData: Buffer | Readable;

						if (documentBinaryData.id) {
							documentUploadData = await this.helpers.getBinaryStream(documentBinaryData.id);
						} else {
							documentUploadData = Buffer.from(documentBinaryData.data, BINARY_ENCODING);
						}

						const additionalFields = this.getNodeParameter(
							'additionalFields',
							itemIndex,
						) as IDataObject;

						const formData: IDataObject = {
							document: {
								value: documentUploadData,
								options: {
									filename: documentData.fileName,
									contentType: documentData.mimeType,
								},
							},
						};

						// Add additional fields to formData
						if (additionalFields.title) {
							formData.title = additionalFields.title as string;
						}
						if (additionalFields.created) {
							formData.created = additionalFields.created as string;
						}
						if (additionalFields.correspondent) {
							formData.correspondent = additionalFields.correspondent as number;
						}
						if (additionalFields.document_type) {
							formData.document_type = additionalFields.document_type as number;
						}
						if (additionalFields.storage_path) {
							formData.storage_path = additionalFields.storage_path as number;
						}
						if (additionalFields.archive_serial_number) {
							formData.archive_serial_number = additionalFields.archive_serial_number as string;
						}

						// Handle tags as array
						if (additionalFields.tags) {
							const tagsString = additionalFields.tags as string;
							const tagsArray = tagsString.split(',').map(tag => tag.trim());
							
							// Add each tag as a separate form field with the same name
							tagsArray.forEach(tagId => {
								if (!formData.tags) {
									formData.tags = [];
								}
								(formData.tags as number[]).push(parseInt(tagId, 10));
							});
						}

						// Handle custom fields as array
						if (additionalFields.custom_fields) {
							const customFieldsString = additionalFields.custom_fields as string;
							const customFieldsArray = customFieldsString.split(',').map(field => field.trim());
							formData.custom_fields = customFieldsArray.map(fieldId => parseInt(fieldId, 10));
						}

						const requestOptions: IRequestOptions = {
							method: 'POST',
							formData,
							uri: `${credentials.domain}/api/documents/post_document/`,
							json: true,
						};

						const responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'paperlessNgxApi',
							requestOptions,
							undefined,
							itemIndex,
						);
						returnData.push({ json: { task_id: responseData } });
					}
				}

				if (resource === Resource.Correspondent) {
					if (operation === Operation.Read) {
						const requestOptions: IRequestOptions = {
							headers: {
								Accept: 'application/json',
							},
							method: 'GET',
							uri: `${credentials.domain}/api/correspondents/`,
							json: true,
						};

						const paginationOptions: PaginationOptions = {
							continue: '={{ $response.body["next"] !== null }}',
							request: {
								url: '={{ $response.body["next"] }}',
							},
							requestInterval: 1,
						};

						const responseData = await this.helpers.requestWithAuthenticationPaginated.call(
							this,
							requestOptions,
							itemIndex,
							paginationOptions,
							'paperlessNgxApi',
						);
						const items = responseData.flatMap((response) =>
							response.body.results.map((result: any) => ({ json: result })),
						);
						returnData.push(...items);
					}

					if (operation === Operation.Create) {
						const name = this.getNodeParameter('name', itemIndex) as string;
						const matchingRegex = this.getNodeParameter('matchingRegex', itemIndex, '') as string;

						const requestOptions: IRequestOptions = {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: {
								name,
								...(matchingRegex ? { matching_regex: matchingRegex } : {}),
							},
							uri: `${credentials.domain}/api/correspondents/`,
							json: true,
						};

						const responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'paperlessNgxApi',
							requestOptions,
							undefined,
							itemIndex,
						);
						returnData.push({ json: responseData });
					}
				}

				if (resource === Resource.DocumentType) {
					if (operation === Operation.Read) {
						const requestOptions: IRequestOptions = {
							headers: {
								Accept: 'application/json',
							},
							method: 'GET',
							uri: `${credentials.domain}/api/document_types/`,
							json: true,
						};

						const paginationOptions: PaginationOptions = {
							continue: '={{ $response.body["next"] !== null }}',
							request: {
								url: '={{ $response.body["next"] }}',
							},
							requestInterval: 1,
						};

						const responseData = await this.helpers.requestWithAuthenticationPaginated.call(
							this,
							requestOptions,
							itemIndex,
							paginationOptions,
							'paperlessNgxApi',
						);
						const items = responseData.flatMap((response) =>
							response.body.results.map((result: any) => ({ json: result })),
						);
						returnData.push(...items);
					}
				}

				if (resource === Resource.Tag) {
					if (operation === Operation.Read) {
						const requestOptions: IRequestOptions = {
							headers: {
								Accept: 'application/json',
							},
							method: 'GET',
							uri: `${credentials.domain}/api/tags/`,
							json: true,
						};

						const paginationOptions: PaginationOptions = {
							continue: '={{ $response.body["next"] !== null }}',
							request: {
								url: '={{ $response.body["next"] }}',
							},
							requestInterval: 1,
						};

						const responseData = await this.helpers.requestWithAuthenticationPaginated.call(
							this,
							requestOptions,
							itemIndex,
							paginationOptions,
							'paperlessNgxApi',
						);
						const items = responseData.flatMap((response) =>
							response.body.results.map((result: any) => ({ json: result })),
						);
						returnData.push(...items);
					}

					if (operation === Operation.Create) {
						const name = this.getNodeParameter('name', itemIndex) as string;
						const color = this.getNodeParameter('color', itemIndex, '#a6cee3') as string;
						const matchingRegex = this.getNodeParameter('matchingRegex', itemIndex, '') as string;

						const requestOptions: IRequestOptions = {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: {
								name,
								color,
								...(matchingRegex ? { matching_regex: matchingRegex } : {}),
							},
							uri: `${credentials.domain}/api/tags/`,
							json: true,
						};

						const responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'paperlessNgxApi',
							requestOptions,
							undefined,
							itemIndex,
						);
						returnData.push({ json: responseData });
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}

					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return this.prepareOutputData(returnData);
	}
}

