import events from 'events';

class CustomeEmitter extends events {}

const exportObject = new CustomeEmitter();
export = exportObject;
