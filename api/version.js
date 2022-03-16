import { version } from '../../package.json';

module.exports = (request, response) => {
	response.send(version);
};
