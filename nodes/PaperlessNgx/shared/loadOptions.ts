import { IDataObject, ILoadOptionsFunctions, INodePropertyOptions, IRequestOptions, NodeOperationError } from 'n8n-workflow';

export const loadOptions = {
	async getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const credentials = await this.getCredentials('paperlessNgxApi');
		const requestOptions: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/api/tags/`,
			json: true,
		};
		const response = await this.helpers.requestWithAuthentication.call(this, 'paperlessNgxApi', requestOptions);
		if (!response.results || !Array.isArray(response.results)) {
			throw new NodeOperationError(this.getNode(), 'Unexpected response format when loading tags');
		}
		return response.results.map((tag: IDataObject) => ({ name: tag.name as string, value: tag.id as number }));
	},

	async getCorrespondents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const credentials = await this.getCredentials('paperlessNgxApi');
		const requestOptions: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/api/correspondents/`,
			json: true,
		};
		const response = await this.helpers.requestWithAuthentication.call(this, 'paperlessNgxApi', requestOptions);
		if (!response.results || !Array.isArray(response.results)) {
			throw new NodeOperationError(this.getNode(), 'Unexpected response format when loading correspondents');
		}
		return response.results.map((c: IDataObject) => ({ name: c.name as string, value: c.id as number }));
	},

	async getDocumentTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const credentials = await this.getCredentials('paperlessNgxApi');
		const requestOptions: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/api/document_types/`,
			json: true,
		};
		const response = await this.helpers.requestWithAuthentication.call(this, 'paperlessNgxApi', requestOptions);
		if (!response.results || !Array.isArray(response.results)) {
			throw new NodeOperationError(this.getNode(), 'Unexpected response format when loading document types');
		}
		return response.results.map((d: IDataObject) => ({ name: d.name as string, value: d.id as number }));
	},
};


