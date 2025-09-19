const logger = (req, res, next) => {
    console.log("--- Incoming Request ---");
    console.log(`Time      : ${new Date().toISOString()}`);
    console.log(`Method    : ${req.method}`);
    console.log(`URL       : ${req.originalUrl}`);
    console.log("Headers   :", req.headers);
    console.log("Query     :", req.query);
    console.log("Body      :", req.body);
    console.log("-----------------------");

    next();
};

export default logger;
