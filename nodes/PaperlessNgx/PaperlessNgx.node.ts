import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { Resource, Operation, ValueOf } from './shared/constants';
import { loadOptions as sharedLoadOptions } from './shared/loadOptions';
import { executeDocuments } from './actions/documents';
import { executeCorrespondents } from './actions/correspondents';
import { executeDocumentTypes } from './actions/documentTypes';
import { executeTags } from './actions/tags';
import { nodeProperties } from './descriptions';

// Interface wurde entfernt, da es nicht verwendet wird

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
		properties: [...nodeProperties],
		credentials: [
			{
				name: 'paperlessNgxApi',
				required: true,
			},
		],
	} as INodeTypeDescription;

	// Methoden zum Laden von Auswahloptionen
	methods = { loadOptions: sharedLoadOptions };

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
					await executeDocuments.call(this, items, itemIndex, operation as string, credentials, returnData);
				}

				if (resource === Resource.Correspondent) {
					await executeCorrespondents.call(this, itemIndex, operation as string, credentials, returnData);
				}

				if (resource === Resource.DocumentType) {
					await executeDocumentTypes.call(this, itemIndex, operation as string, credentials, returnData);
				}

				if (resource === Resource.Tag) {
					await executeTags.call(this, itemIndex, operation as string, credentials, returnData);
				}
			} catch (error) {
	if (this.continueOnFail()) {
		items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
	} else {
		if ((error as any).context) {
			(error as any).context.itemIndex = itemIndex;
			throw error;
		}
		throw new NodeOperationError(this.getNode(), error as any, { itemIndex });
	}
			}
		}

		return this.prepareOutputData(returnData);
	}
}
