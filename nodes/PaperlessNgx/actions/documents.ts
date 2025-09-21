import { BINARY_ENCODING, IDataObject, IExecuteFunctions, IRequestOptions, PaginationOptions, NodeOperationError } from 'n8n-workflow';
import { Readable } from 'stream';

export async function executeDocuments(this: IExecuteFunctions, items: any[], itemIndex: number, operation: string, credentials: any, returnData: any[]) {
	if (operation === 'read') {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		const requestOptions: IRequestOptions = {
			headers: { Accept: 'application/json' },
			qs: { search: additionalFields.search },
			method: 'GET',
			uri: `${credentials.domain}/api/documents/`,
			json: true,
		};
		const paginationOptions: PaginationOptions = {
			continue: '={{ $response.body["next"] !== null }}',
			request: { url: '={{ $response.body["next"] }}' },
			requestInterval: 1,
		};
		const responseData = await this.helpers.requestWithAuthenticationPaginated.call(this, requestOptions, itemIndex, paginationOptions, 'paperlessNgxApi');
		const out = responseData.flatMap((response: any) => response.body.results.map((result: any) => ({ json: result })));
		returnData.push(...out);
	}

	if (operation === 'create') {
		const documentFieldName = this.getNodeParameter('file', itemIndex, 'data') as string;
		const documentData = this.helpers.assertBinaryData(itemIndex, documentFieldName);
		const documentBinaryData = items[itemIndex].binary![documentFieldName];
		let documentUploadData: Buffer | Readable;
		if (documentBinaryData.id) {
			documentUploadData = await this.helpers.getBinaryStream(documentBinaryData.id);
		} else {
			documentUploadData = Buffer.from(documentBinaryData.data, BINARY_ENCODING);
		}
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
		const formData: IDataObject = {
			document: {
				value: documentUploadData,
				options: { filename: documentData.fileName, contentType: documentData.mimeType },
			},
		};
		if (additionalFields.title) formData.title = additionalFields.title as string;
		if (additionalFields.created) formData.created = additionalFields.created as string;
		if (additionalFields.correspondent) formData.correspondent = additionalFields.correspondent as number;
		if (additionalFields.document_type) formData.document_type = additionalFields.document_type as number;
		if (additionalFields.storage_path) formData.storage_path = additionalFields.storage_path as number;
		if (additionalFields.archive_serial_number) formData.archive_serial_number = additionalFields.archive_serial_number as string;
		if (additionalFields.tags) {
			const tagsArray = (additionalFields.tags as string).split(',').map((t) => t.trim());
			formData.tags = tagsArray.map((id) => parseInt(id, 10));
		}
		if (additionalFields.custom_fields) {
			const customFieldsArray = (additionalFields.custom_fields as string).split(',').map((f) => f.trim());
			formData.custom_fields = customFieldsArray.map((id) => parseInt(id, 10));
		}
		const requestOptions: IRequestOptions = {
			method: 'POST',
			formData,
			uri: `${credentials.domain}/api/documents/post_document/`,
			json: true,
		};
		const responseData = await this.helpers.requestWithAuthentication.call(this, 'paperlessNgxApi', requestOptions, undefined, itemIndex);
		returnData.push({ json: { task_id: responseData } });
	}

	if (operation === 'list') {
		const searchOptions = this.getNodeParameter('searchOptions', itemIndex, {}) as IDataObject;
		const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
		const limit = this.getNodeParameter('limit', itemIndex, 25) as number;
		const ordering = this.getNodeParameter('ordering', itemIndex, '-created') as string;
		let params: IDataObject = {};
		if (searchOptions.query) params.query = searchOptions.query;
		if (searchOptions.more_like_id && Number(searchOptions.more_like_id) > 0) params.more_like_id = searchOptions.more_like_id;
		Object.assign(params, filters);
		params.page_size = limit;
		if (ordering) params.ordering = ordering;
		for (const key in params) {
			if (key.endsWith('__id__in') && Array.isArray(params[key])) {
				params[key] = (params[key] as number[]).join(',');
			}
		}
		const extractFilterParams = (p: IDataObject) => {
			const idFilters: Record<string, number[]> = {};
			for (const key in p) {
				if (key.endsWith('__id__in')) {
					const baseName = key.replace('__id__in', '');
					const idValues = typeof p[key] === 'string' ? (p[key] as string).split(',').map((id) => parseInt(id.trim(), 10)) : (Array.isArray(p[key]) ? (p[key] as number[]) : [p[key] as number]);
					idFilters[baseName] = idValues;
				}
			}
			return idFilters;
		};
		const filterParams = extractFilterParams(params);
		const responseData = await this.helpers.requestWithAuthentication.call(this, 'paperlessNgxApi', { method: 'GET', uri: `${credentials.domain}/api/documents/`, qs: params, json: true }, undefined, itemIndex);
		if (responseData && responseData.results && Array.isArray(responseData.results)) {
			returnData.push(...responseData.results.map((result: IDataObject) => ({ json: result })));
		} else {
			const filterDescriptions = Object.entries(filterParams).map(([field, ids]) => `${field} (IDs: ${ids.join(', ')})`).join(', ');
			returnData.push({ json: { message: `Keine Dokumente mit den angegebenen Filtern gefunden: ${filterDescriptions}`, appliedFilters: filterParams, originalParams: params } });
		}
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('id', itemIndex) as number;
		const updateFields = this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;
		const body: IDataObject = {};
		for (const key of Object.keys(updateFields)) {
			if (key === 'tags' && Array.isArray(updateFields.tags)) {
				body[key] = updateFields[key];
			} else if (key === 'custom_fields' && typeof updateFields.custom_fields === 'string') {
				try {
					body[key] = JSON.parse(updateFields.custom_fields as string);
				} catch (e) {
					throw new NodeOperationError(this.getNode(), `Custom Fields müssen ein gültiges JSON-Format haben: ${e}`, { itemIndex });
				}
			} else if (updateFields[key] !== undefined && updateFields[key] !== null) {
				body[key] = updateFields[key];
			}
		}
		const requestOptions: IRequestOptions = { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body, uri: `${credentials.domain}/api/documents/${id}/`, json: true };
		const responseData = await this.helpers.requestWithAuthentication.call(this, 'paperlessNgxApi', requestOptions, undefined, itemIndex);
		returnData.push({ json: responseData });
	}

	if (operation === 'download') {
		const id = this.getNodeParameter('id', itemIndex) as number;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
		const requestOptions: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/api/documents/${id}/download/`,
			json: false,
			encoding: null,
			headers: { Accept: '*/*' },
		};
		const data = (await this.helpers.requestWithAuthentication.call(this, 'paperlessNgxApi', requestOptions, undefined, itemIndex)) as Buffer;
		const newItem = { json: {}, binary: {} as any };
		newItem.binary[binaryPropertyName] = await this.helpers.prepareBinaryData(data, `document_${id}.pdf`);
		returnData.push(newItem as any);
	}
}
