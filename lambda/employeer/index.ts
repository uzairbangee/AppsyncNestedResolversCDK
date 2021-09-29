const {employers} = require('/opt/data');

exports.handler = async (event: any) => {
    console.log("event ", event)
    const employ = employers.filter((em: any) => em.id === event.employerId)[0];
    console.log("event ", employ)
    return employ;
}