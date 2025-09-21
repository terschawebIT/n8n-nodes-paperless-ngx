import { IExecuteFunctions, IRequestOptions, PaginationOptions } from 'n8n-workflow';

export async function executeDocumentTypes(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
	credentials: any,
	returnData: any[],
) {
	if (operation === 'read') {
		const requestOptions: IRequestOptions = {
			headers: { Accept: 'application/json' },
			method: 'GET',
			uri: `${credentials.domain}/api/document_types/`,
			json: true,
		};

		const paginationOptions: PaginationOptions = {
			continue: '={{ $response.body["next"] !== null }}',
			request: { url: '={{ $response.body["next"] }}' },
			requestInterval: 1,
		};

		const responseData = await this.helpers.requestWithAuthenticationPaginated.call(
			this,
			requestOptions,
			itemIndex,
			paginationOptions,
			'paperlessNgxApi',
		);
		const items = responseData.flatMap((response: any) => response.body.results.map((result: any) => ({ json: result })));
		returnData.push(...items);
	}
}


