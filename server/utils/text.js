const normalizeText = (value = '') => {
	if (typeof value !== 'string') {
		return '';
	}

	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
};

module.exports = {
	normalizeText,
};
