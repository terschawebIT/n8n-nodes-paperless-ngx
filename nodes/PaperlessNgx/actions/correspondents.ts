import { IExecuteFunctions, IRequestOptions, PaginationOptions } from 'n8n-workflow';

export async function executeCorrespondents(
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
			uri: `${credentials.domain}/api/correspondents/`,
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

	if (operation === 'create') {
		const name = this.getNodeParameter('name', itemIndex) as string;
		const matchingRegex = this.getNodeParameter('matchingRegex', itemIndex, '') as string;

		const requestOptions: IRequestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: { name, ...(matchingRegex ? { matching_regex: matchingRegex } : {}) },
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


