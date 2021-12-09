const { Op } = require('sequelize');

module.exports = replaceOperators;

const operatorsMap = { // Add additional operators as needed.
    $gt: Op.gt,
    $gte: Op.gte,
    $lt: Op.lt,
    $lte: Op.lte,
    $like: Op.like,
    $between: Op.between,
    $in: Op.in
};
function replaceOperators(oldObject) {
    let newObject = {};
    for (let key in oldObject) {
        let value = oldObject[key];

        if (typeof value === 'object') {
            if(value instanceof Date){
                let op = operatorsMap[key];
                newObject[op] = value;
            }
            else{
                newObject[key] = replaceOperators(value); // Recurse
            }

        } else if (operatorsMap[key]) {
            let op = operatorsMap[key];
            newObject[op] = value;

        } else {
            newObject[key] = value;
        }
    }
    return newObject;
}