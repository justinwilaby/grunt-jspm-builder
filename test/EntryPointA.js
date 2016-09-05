import ModuleA from './src/ModuleA';

class EntryPointA {
	constructor() {
		console.log('EntryPointA constructed');
		const moduleA = new ModuleA();
	}
}
export default EntryPointA;