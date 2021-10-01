// Send Error in JSON
const sendError = (res, respCode, error) => {
    console.log(`Error is ${error}`);
    res.status(respCode).end(JSON.stringify({ Error: error }));
}

module.exports = sendError;