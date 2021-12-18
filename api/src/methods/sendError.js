// Send Error in JSON
const sendError = (res, respCode, error) => {
	//console.log(`Error is ${error}`);
	res.status(respCode).json({ Error: error });
};

module.exports = sendError;