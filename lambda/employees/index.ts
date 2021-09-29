const {employees} = require('/opt/data');

exports.handler = async (event: any) => {
    console.log("event ", event)
    return employees.filter((em: any) => em.employerId === event.employerId);
}