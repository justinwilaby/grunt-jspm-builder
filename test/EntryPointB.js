import ModuleB from './src/ModuleB';
import ModuleC from './src/ModuleC';

class EntryPointB {
	constructor() {
		console.log('EntryPointB constructed');
		const moduleB = new ModuleB();
		const moduleC = new ModuleC();
	}
}
export default EntryPointB;