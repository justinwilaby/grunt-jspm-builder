import LibA from '../libs/LibA';
import LibB from '../libs/LibB';
class ModuleB{
	constructor(){
		const LibA = new LibA();
		const LibB = new LibB();
	}
}
export default ModuleB;