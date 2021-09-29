const data = require('/opt/data');

exports.handler = async (event: any) => {
    console.log("event ", event)
    return data.employees;
}