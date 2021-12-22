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
    console.log(oldObject)
    console.log("object\n\n\n");
    for (let key in oldObject) {
        let value = oldObject[key];
        if (typeof value === 'object') {
            console.log('object\n');
            if(value instanceof Date){
            console.log('date\n');

                let op = operatorsMap[key];
                newObject[op] = value;
            }
            else{
               if(key == '$between'){
                let op = operatorsMap[key];
                newObject[op] =  JSON.parse(value);
                console.log(newObject);
               }
                newObject[key] = replaceOperators(value); // Recurse
            }

        } else if (operatorsMap[key]) {
            if(key=='$in'){
                console.log('in\n');
                let op = operatorsMap[key];
                newObject[op] =  JSON.parse(value);
            }
            if(key=='$between'){
                console.log('ll\n');
                let op = operatorsMap[key];
                Op.between =  value;
                console.log(op);
                console.log(value);
                console.log('ll\n');

            }
            else{
                console.log('else 2nd last\n');
                let op = operatorsMap[key];
                newObject[op] = value;
            }
        } else {
            console.log('else last\n');
            console.log(key);
            console.log(value);
            newObject[key] = value;
        }
    }
    return newObject;
}